/**
 * 日付フォーマット変換 (届出書用)。
 *
 * docx 出力時に ISO 形式 "YYYY-MM-DD" を以下に変換する:
 *   - "wareki" (和暦)  例: "令和8年5月25日"  (default)
 *   - "seireki" (西暦) 例: "2026年5月25日"
 *
 * 元号判定:
 *   令和 2019-05-01 以降
 *   平成 1989-01-08 〜 2019-04-30
 *   昭和 1926-12-25 〜 1989-01-07
 *   (それ以前は ISO 文字列のまま返す。届出書の用途では発生しない想定)
 *
 * 注: 元年 (1年目) を「元年」と書くか「1年」と書くかは書類仕様により異なる。
 *     本実装は「1年」表記を採用 (正確性重視・全自治体で受理される表記)。
 *
 * 入力が ISO 形式でない場合 (空文字 / 既に変換済 / 自由記述) はそのまま返す。
 */

export type DateFormat = "wareki" | "seireki";

interface EraSpec {
  name: string;
  startEpochMs: number;
  startYear: number;
}

// 各元号の開始日 (UTC ではなく日本時間として扱う)
const ERAS: EraSpec[] = [
  { name: "令和", startEpochMs: Date.UTC(2019, 4, 1), startYear: 2019 },
  { name: "平成", startEpochMs: Date.UTC(1989, 0, 8), startYear: 1989 },
  { name: "昭和", startEpochMs: Date.UTC(1926, 11, 25), startYear: 1926 },
];

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function formatDate(value: string, format: DateFormat = "wareki"): string {
  if (!value) return "";
  const m = ISO_DATE_RE.exec(value);
  if (!m) return value; // 既に変換済 or 自由記述 はそのまま
  const y = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const day = parseInt(m[3], 10);

  if (format === "seireki") {
    return `${y}年${month}月${day}日`;
  }

  // wareki
  const epoch = Date.UTC(y, month - 1, day);
  const era = ERAS.find((e) => epoch >= e.startEpochMs);
  if (!era) {
    // 昭和より前 → ISO のまま返す
    return value;
  }
  const eraYear = y - era.startYear + 1;
  return `${era.name}${eraYear}年${month}月${day}日`;
}
