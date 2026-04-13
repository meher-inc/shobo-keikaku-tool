"use client";

export default function SubscribeSuccessPage() {
  return (
    <>
      <style jsx global>{`
        body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Noto Sans JP', sans-serif; background: #f5f5f7; color: #1d1d1f; margin: 0; }
      `}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <div style={{
          background: "#fff", borderRadius: 24, padding: "48px 32px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#127881;</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            サブスクリプション登録ありがとうございます
          </h1>
          <p style={{ fontSize: 15, color: "#86868b", lineHeight: 1.6, marginBottom: 32 }}>
            Word ファイルは数分以内にメールでお送りします。<br />
            契約内容の確認・変更はマイページから行えます。
          </p>

          <a
            href="/account"
            style={{
              display: "block", width: "100%", padding: 14, borderRadius: 14,
              background: "#E8332A", color: "#fff", fontSize: 16, fontWeight: 600,
              textDecoration: "none", marginBottom: 12, textAlign: "center",
            }}
          >
            マイページへ
          </a>
          <a
            href="/"
            style={{
              display: "block", padding: 14, borderRadius: 14,
              background: "#f5f5f7", color: "#E8332A", fontSize: 15, fontWeight: 600,
              textDecoration: "none", textAlign: "center",
            }}
          >
            トップに戻る
          </a>
        </div>
      </div>
    </>
  );
}
