// 使用方法（リポジトリ root から実行）:
//   dry-run: npx tsx --env-file=.env.local scripts/campaign-legacy-leads/individual-send.ts --dry-run
//   本番:    npx tsx --env-file=.env.local scripts/campaign-legacy-leads/individual-send.ts --execute
//
// 必須env: RESEND_API_KEY、ANTHROPIC_API_KEY、(dry-run時のみ) DRY_RUN_EMAIL

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Resend } from 'resend';
import Anthropic from '@anthropic-ai/sdk';
import type { Lead, SendResult } from './types';
import {
  buildIndividualXSubject, buildIndividualXBody,
  buildIndividualYSubject, buildIndividualYBody,
  buildIndividualZSubject, buildIndividualZBody,
  SENDER, REPLY_TO,
} from './templates';

const isDryRun = process.argv.includes('--dry-run');
const isExecute = process.argv.includes('--execute');
const dryRunTarget = process.env.DRY_RUN_EMAIL || '';

if (!isDryRun && !isExecute) {
  console.error('Usage: --dry-run or --execute');
  process.exit(1);
}

if (isDryRun && !dryRunTarget) {
  console.error('Set DRY_RUN_EMAIL env var for dry-run');
  process.exit(1);
}

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not set');
  process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set');
  process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);
const anthropic = new Anthropic();
const csvPath = path.join(__dirname, 'data/leads.csv');
const logPath = path.join(__dirname, `logs/individual-send-${new Date().toISOString().replace(/:/g, '-')}.json`);

// 「○○ 様」末尾を除去してテンプレートの「${name}様」に合わせる
function stripHonorific(salutation: string): string {
  return salutation.replace(/\s*様\s*$/, '').trim();
}

// 内容（生の問い合わせ本文）から1行要約を生成。「代行」系の語を出さない制約付き。
async function summarizeOneLiner(rawContent: string): Promise<string> {
  const fallback = rawContent.slice(0, 20);
  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `以下の問い合わせ内容を、メール本文に差し込む「概要1行」として20字以内で要約してください。
「〇〇の件」という形式で、体言止め。余分な説明は不要。

【絶対の制約】
- 「代行」「申請代行」「書類代行」という語は絶対に使わないこと。
- 代わりに「消防計画作成のご相談」「届出書類の準備」「防火管理手続きのご相談」等で言い換えること。

問い合わせ内容：${rawContent}
回答（1行のみ）：`,
      }],
    });

    const text = msg.content.find(b => b.type === 'text')?.text ?? fallback;
    // 後処理：万一「代行」が混入していても安全側で置換
    return text.trim().replace(/「|」/g, '').replace(/代行/g, 'ご相談');
  } catch (err) {
    console.warn(`  ⚠️ summarizeOneLiner失敗、フォールバックを使用: ${String(err)}`);
    return fallback.replace(/代行/g, 'ご相談');
  }
}

async function main() {
  const raw = fs.readFileSync(csvPath, 'utf-8').replace(/^﻿/, '');
  const records = parse(raw, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

  const targets = records.filter(r => r['セグメント'] === '個別対応');

  if (targets.length === 0) {
    console.error('個別対応対象の行が見つかりません');
    process.exit(1);
  }

  const xCount = targets.filter(r => (r['文面パターン'] ?? '').startsWith('X')).length;
  const yCount = targets.filter(r => (r['文面パターン'] ?? '').startsWith('Y')).length;
  const zCount = targets.filter(r => (r['文面パターン'] ?? '').startsWith('Z')).length;
  console.log(`個別対応件数: ${targets.length}件（X:${xCount} / Y:${yCount} / Z:${zCount}）`);
  if (isDryRun) {
    console.log(`[DRY-RUN] テスト送信先: ${dryRunTarget}（先頭1件のみ）`);
  }

  const processList = isDryRun ? [targets[0]] : targets;
  const results: SendResult[] = [];

  for (const record of processList) {
    const finalSalutation = record['宛名_最終'] ?? '';
    const nameForTemplate = stripHonorific(finalSalutation || record['お名前']);
    const rawContent = record['内容'] ?? '';
    const facePattern = (record['文面パターン'] ?? '') as Lead['facePattern'];
    const email = isDryRun ? dryRunTarget : record['メールアドレス'];

    console.log(`  概要生成中: ${nameForTemplate}...`);
    const summaryOneLiner = await summarizeOneLiner(rawContent);
    console.log(`  → "${summaryOneLiner}"`);

    let subject: string;
    let body: string;

    if (typeof facePattern === 'string' && facePattern.startsWith('X')) {
      subject = buildIndividualXSubject();
      body = buildIndividualXBody(nameForTemplate, summaryOneLiner);
    } else if (typeof facePattern === 'string' && facePattern.startsWith('Y')) {
      subject = buildIndividualYSubject();
      body = buildIndividualYBody(nameForTemplate, summaryOneLiner);
    } else if (typeof facePattern === 'string' && facePattern.startsWith('Z')) {
      subject = buildIndividualZSubject();
      body = buildIndividualZBody(nameForTemplate, summaryOneLiner);
    } else {
      console.warn(`⚠️ 未知の文面パターン: "${facePattern}"、スキップ`);
      results.push({
        email,
        name: nameForTemplate,
        segment: '個別対応',
        facePattern,
        status: 'skipped',
        error: `Unknown pattern: ${facePattern}`,
        timestamp: new Date().toISOString(),
      });
      continue;
    }

    try {
      const result = await resend.emails.send({
        from: SENDER,
        to: email,
        replyTo: REPLY_TO,
        subject,
        text: body,
      });

      if (result.error) throw new Error(JSON.stringify(result.error));

      console.log(`✅ 送信: ${nameForTemplate} <${email}> [${facePattern}] → ${result.data?.id}`);
      results.push({
        email,
        name: nameForTemplate,
        segment: '個別対応',
        facePattern,
        status: 'sent',
        messageId: result.data?.id,
        timestamp: new Date().toISOString(),
      });

      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`❌ エラー: ${nameForTemplate} <${email}>`, err);
      results.push({
        email,
        name: nameForTemplate,
        segment: '個別対応',
        facePattern,
        status: 'error',
        error: String(err),
        timestamp: new Date().toISOString(),
      });
    }
  }

  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
  const sent = results.filter(r => r.status === 'sent').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const errored = results.filter(r => r.status === 'error').length;
  console.log(`\n📊 結果: 送信${sent}件 / スキップ${skipped}件 / エラー${errored}件`);
  console.log(`📁 ログ: ${logPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
