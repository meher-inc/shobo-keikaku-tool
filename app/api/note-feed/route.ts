import { NextResponse } from "next/server";

/**
 * note.com マガジン「消防計画づくりの実務ノート」の最新記事を集約して返す。
 *
 * LP の更新情報セクション（components/note-updates.tsx）がこの API を叩く。
 * note 側に投稿すると ISR の再取得（revalidate）でLPに自動反映される。
 *
 * 対象マガジンの RSS を増減する場合は MAGAZINE_FEEDS を編集する。
 */

export const revalidate = 3600; // 1時間ごとに再取得

const MAGAZINE_FEEDS = [
  "https://note.com/shun_maruoka/m/m9f1348968657/rss",
  "https://note.com/todokede/m/mb821e060300f/rss",
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
        ? `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
        : "";
    out.push({ title, link, iso, date, thumbnail: tag(b, "media:thumbnail") });
  }
  return out;
}

export async function GET() {
  try {
    const results = await Promise.all(
      MAGAZINE_FEEDS.map(async (url) => {
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
