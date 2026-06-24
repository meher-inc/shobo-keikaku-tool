import { NextResponse } from "next/server";

/**
 * note の「消防計画」キュレーション・マガジンの最新記事を集約して LP に返す。
 *
 * 取得元はマガジン単位。消防計画に関する記事だけをマガジンにまとめて反映する方針。
 * 重要: note のマガジンRSSは「マガジンに追加した記事」しか出ない。新しい記事を
 *       LPに反映したい場合は、note 側でその記事を対象マガジンに追加すること。
 *
 * LP の更新情報セクション（components/note-updates.tsx）がこの API を叩く。
 * 対象マガジンを増減する場合は FEEDS を編集する。
 */

export const revalidate = 600; // 10分ごとに再取得（note 投稿の反映を速める）

const FEEDS = [
  "https://note.com/shun_maruoka/m/m9f1348968657/rss", // 消防計画づくりの実務ノート（消防計画キュレーション）
  "https://note.com/todokede/m/mb821e060300f/rss", // トドケデ公式マガジン
];

const MAX_ITEMS = 6;

interface NoteItem {
  title: string;
  link: string;
  iso: string; // ISO 8601（並び替え用）
  date: string; // "2026年6月6日"（表示用）
  thumbnail?: string;
}

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function tag(block: string, name: string): string | undefined {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : undefined;
}

function parseFeed(xml: string): NoteItem[] {
  const out: NoteItem[] = [];
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/g) || [];
  for (const b of blocks) {
    const title = tag(b, "title");
    const link = tag(b, "link");
    const pub = tag(b, "pubDate");
    if (!title || !link) continue;
    const d = pub ? new Date(pub) : null;
    const iso = d && !Number.isNaN(d.getTime()) ? d.toISOString() : "";
    const date =
      d && !Number.isNaN(d.getTime())
        ? d.toLocaleDateString("ja-JP", {
            timeZone: "Asia/Tokyo",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "";
    out.push({ title, link, iso, date, thumbnail: tag(b, "media:thumbnail") });
  }
  return out;
}

export async function GET() {
  try {
    const results = await Promise.all(
      FEEDS.map(async (url) => {
        try {
          const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; todokede-lp/1.0)" },
            next: { revalidate },
          });
          if (!res.ok) return [] as NoteItem[];
          return parseFeed(await res.text());
        } catch {
          return [] as NoteItem[];
        }
      })
    );

    const seen = new Set<string>();
    const items = results
      .flat()
      .filter((it) => {
        if (seen.has(it.link)) return false;
        seen.add(it.link);
        return true;
      })
      .sort((a, b) => (a.iso < b.iso ? 1 : a.iso > b.iso ? -1 : 0))
      .slice(0, MAX_ITEMS);

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
