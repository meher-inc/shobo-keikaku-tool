import Link from "next/link";

export const metadata = {
  title: "消防計画の書き方｜作成の手順・記載項目・提出先をやさしく解説",
  description:
    "消防計画とは何か、誰に作成義務があるのか、記載する項目・作成手順・所轄消防署への提出方法までを、はじめての方向けにわかりやすく解説します。元消防士監修の自動作成ツールもご案内。",
  openGraph: {
    title: "消防計画の書き方｜作成の手順・記載項目・提出先をやさしく解説",
    description:
      "消防計画とは・誰に義務があるか・記載項目・作成手順・所轄消防署への提出方法を、はじめての方向けに解説します。",
    url: "https://plan.todokede.jp/shobo-keikaku-no-kakikata",
    siteName: "トドケデ消防計画",
    images: ["https://plan.todokede.jp/og-image.png"],
    locale: "ja_JP",
    type: "article",
  },
  alternates: {
    canonical: "https://plan.todokede.jp/shobo-keikaku-no-kakikata",
  },
};

const wrap: React.CSSProperties = {
  maxWidth: 760,
  margin: "0 auto",
  padding: "clamp(40px,7vw,72px) clamp(16px,4vw,24px)",
};
const h2: React.CSSProperties = {
  fontSize: "clamp(20px,3.5vw,26px)",
  fontWeight: 800,
  color: "var(--text)",
  letterSpacing: "-0.01em",
  marginTop: 48,
  marginBottom: 16,
};
const p: React.CSSProperties = {
  fontSize: 15.5,
  lineHeight: 1.9,
  color: "var(--text)",
  marginBottom: 14,
};
const li: React.CSSProperties = { fontSize: 15.5, lineHeight: 1.9, color: "var(--text)" };
const card: React.CSSProperties = {
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: "18px 20px",
};

export default function GuidePage() {
  return (
    <article style={wrap}>
      <nav aria-label="パンくず" style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
        <Link href="/" style={{ color: "var(--brand)", textDecoration: "none" }}>トドケデ消防計画</Link>
        <span style={{ margin: "0 8px" }}>›</span>
        消防計画の書き方
      </nav>

      <h1 style={{ fontSize: "clamp(26px,5vw,38px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.25, color: "var(--text)", marginBottom: 16 }}>
        消防計画の書き方
      </h1>
      <p style={{ ...p, fontSize: 16.5, color: "var(--text-muted)" }}>
        「消防計画を提出してください」と言われたものの、何をどう書けばいいか分からない——。
        このページでは、<strong>消防計画とは何か</strong>、<strong>誰に作成義務があるのか</strong>、
        <strong>記載項目・作成手順・提出方法</strong>までを、はじめての方向けに順を追って解説します。
      </p>

      <h2 style={h2}>消防計画とは</h2>
      <p style={p}>
        消防計画とは、建物の防火管理について定めた計画書で、火災を予防し、万一の際に被害を最小限に抑えるための
        体制・手順をまとめたものです。消防法にもとづき、一定規模以上の建物では
        <strong>防火管理者を選任し、消防計画を作成して所轄の消防署へ届け出る</strong>ことが求められます。
      </p>

      <h2 style={h2}>消防計画が必要なのはどんな建物か</h2>
      <p style={p}>
        防火管理者の選任と消防計画の作成が必要かどうかは、建物の用途と収容人員などによって決まります。
        飲食店・物販店・ホテルなどの不特定多数が出入りする特定用途では、
        <strong>収容人員が30人以上</strong>になると防火管理者の選任義務が生じるのが一般的です
        （特定用途で収容30人以上・延床300㎡以上の場合は甲種、それ以外は乙種の防火管理者）。
      </p>
      <div style={card}>
        <p style={{ ...p, marginBottom: 0, fontSize: 14.5 }}>
          防火管理者の資格は、1〜2日の講習で取得できます。お近くの消防署、または一般財団法人 日本防火・防災協会の
          講習で受講できます。ご自身の建物が対象かどうかは、所轄の消防署にご確認ください。
        </p>
      </div>

      <h2 style={h2}>消防計画に記載する主な項目</h2>
      <ul style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 22, margin: "8px 0" }}>
        <li style={li}>建物の概要（所在地・用途・規模・収容人員）</li>
        <li style={li}>管理権原者・防火管理者と、その業務範囲</li>
        <li style={li}>自衛消防の組織（通報・初期消火・避難誘導などの担当）</li>
        <li style={li}>火災を予防するための日常の点検・自主検査</li>
        <li style={li}>消防用設備等の維持管理・法定点検</li>
        <li style={li}>火災・地震などの発生時の応急対応と避難経路</li>
        <li style={li}>防火に関する教育・訓練の実施計画</li>
        <li style={li}>各階の平面図・避難経路図</li>
      </ul>

      <h2 style={h2}>作成から提出までの手順</h2>
      <ol style={{ display: "flex", flexDirection: "column", gap: 12, paddingLeft: 22, margin: "8px 0" }}>
        <li style={li}><strong>様式を用意する</strong>：所轄消防本部の様式に沿って作成します。様式は消防本部によって異なります。</li>
        <li style={li}><strong>建物情報を記入する</strong>：上記の項目を、自分の建物にあわせて記入します。</li>
        <li style={li}><strong>平面図・避難経路図を添える</strong>：各階の間取りに避難経路や設備の位置を記入します。</li>
        <li style={li}><strong>届出書とともに提出する</strong>：「消防計画作成（変更）届出書」を用意し、本計画書とあわせて正副2部を所轄消防署の予防課窓口へ提出します。受付印のある副本は事業所で保管します。</li>
      </ol>

      <h2 style={h2}>はじめての方がつまずきやすい点</h2>
      <ul style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 22, margin: "8px 0" }}>
        <li style={li}><strong>様式さがし</strong>：消防本部ごとに様式が異なり、どれを使うか分かりにくい。</li>
        <li style={li}><strong>専門用語</strong>：管理権原者・自衛消防組織など、慣れない用語が多い。</li>
        <li style={li}><strong>平面図・避難経路図</strong>：図面の用意や避難経路の書き込みに手間がかかる。</li>
        <li style={li}><strong>届出書の同封漏れ</strong>：計画書だけを持参し、届出書を忘れてしまう。</li>
      </ul>

      {/* ツールへの導線 */}
      <div style={{ marginTop: 48, background: "var(--brand-tint)", border: "1px solid var(--brand-tint-border)", borderRadius: 16, padding: "clamp(24px,5vw,32px)", textAlign: "center" }}>
        <h2 style={{ ...h2, marginTop: 0, marginBottom: 10 }}>入力するだけで、提出できる消防計画に</h2>
        <p style={{ ...p, color: "var(--text-muted)", marginBottom: 20 }}>
          トドケデ消防計画なら、所在地から所轄消防本部を自動判定し、様式に沿った消防計画を約15分でWord作成。
          元消防士監修・買い切りで、平面図テンプレートや提出のしかたも同梱します。
        </p>
        <Link href="/" style={{ display: "inline-block", background: "var(--brand)", color: "#fff", padding: "15px 36px", borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(46,95,158,0.25)" }}>
          消防計画を作成する
        </Link>
        <div style={{ marginTop: 14 }}>
          <Link href="/pricing" style={{ fontSize: 14, fontWeight: 600, color: "var(--brand)", textDecoration: "underline" }}>
            料金プランを見る
          </Link>
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: "var(--text-faint)", lineHeight: 1.8, marginTop: 28 }}>
        ※本ページは一般的な情報をまとめたものです。防火管理者の選任義務の有無、必要な様式、提出方法は
        建物の用途・規模や所轄消防署により異なります。最終的なご判断は所轄の消防署にご確認ください。
      </p>
    </article>
  );
}
