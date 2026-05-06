// 使用方法（リポジトリ root から実行）:
//   dry-run: npx tsx --env-file=.env.local scripts/campaign-legacy-leads/bulk-send.ts --dry-run
//   本番:    npx tsx --env-file=.env.local scripts/campaign-legacy-leads/bulk-send.ts --execute
//
// 必須env: RESEND_API_KEY、(dry-run時のみ) DRY_RUN_EMAIL

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Resend } from 'resend';
import type { Lead, SendResult } from './types';
import { buildBulkSubject, buildBulkBody, SENDER, REPLY_TO } from './templates';

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

const resend = new Resend(process.env.RESEND_API_KEY);
const csvPath = path.join(__dirname, 'data/leads.csv');
const logPath = path.join(__dirname, `logs/bulk-send-${new Date().toISOString().replace(/:/g, '-')}.json`);

async function main() {
  const raw = fs.readFileSync(csvPath, 'utf-8').replace(/^﻿/, '');
  const records = parse(raw, { columns: true, skip_empty_lines: true }) as Record<string, string>[];

  const targets = records.filter(r => r['セグメント'] === '一斉送信');

  if (targets.length === 0) {
    console.error('一斉送信対象の行が見つかりません');
    process.exit(1);
  }

  console.log(`対象件数: ${targets.length}件`);
  if (isDryRun) {
    console.log(`[DRY-RUN] テスト送信先: ${dryRunTarget}（先頭1件のみ）`);
  }

  const processList = isDryRun ? [targets[0]] : targets;
  const results: SendResult[] = [];

  for (const record of processList) {
    const lead: Lead = {
      category: record['区分'] ?? '',
      name: record['お名前'],
      email: isDryRun ? dryRunTarget : record['メールアドレス'],
      domain: record['ドメイン'] ?? '',
      serviceTarget: record['検討サービス/目的'] ?? '',
      content: record['内容'] ?? '',
      contentLen: record['内容文字数'] ?? '',
      segment: record['セグメント'] as Lead['segment'],
      facePattern: record['文面パターン'] as Lead['facePattern'],
      reason: record['理由'] ?? '',
      finalSalutation: record['宛名_最終'] ?? '',
      summaryOneLiner: record['概要要約'] ?? '',
    };

    try {
      const result = await resend.emails.send({
        from: SENDER,
        to: lead.email,
        replyTo: REPLY_TO,
        subject: buildBulkSubject(),
        text: buildBulkBody(),
      });

      if (result.error) {
        throw new Error(JSON.stringify(result.error));
      }

      console.log(`✅ 送信: ${lead.name} <${lead.email}> → ${result.data?.id}`);
      results.push({
        email: lead.email,
        name: lead.name,
        segment: lead.segment,
        facePattern: lead.facePattern,
        status: 'sent',
        messageId: result.data?.id,
        timestamp: new Date().toISOString(),
      });

      // レート制限対策: 100ms間隔
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      console.error(`❌ エラー: ${lead.name} <${lead.email}>`, err);
      results.push({
        email: lead.email,
        name: lead.name,
        segment: lead.segment,
        facePattern: lead.facePattern,
        status: 'error',
        error: String(err),
        timestamp: new Date().toISOString(),
      });
    }
  }

  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
  const sent = results.filter(r => r.status === 'sent').length;
  const errored = results.filter(r => r.status === 'error').length;
  console.log(`\n📊 結果: 送信${sent}件 / エラー${errored}件`);
  console.log(`📁 ログ: ${logPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
