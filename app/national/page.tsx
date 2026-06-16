import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { listNationalPacks } from "@/lib/engine-v2/national/registry";
import {
  SESSION_COOKIE_NAME,
  verifyToken,
} from "@/lib/session-token";
import { checkAccess, redirectPathForDecision } from "@/lib/national-access";

export const metadata: Metadata = {
  title: "全国統一様式 届出書 自動生成 ｜ トドケデ消防計画",
  description:
    "消防法施行規則および火災予防条例に基づく届出書（防火管理者選任届、消防計画届、消防用設備等設置届ほか）を、入力ベースでWord形式で自動生成します。",
  robots: { index: false, follow: false },
};

export default async function NationalIndexPage() {
  // 2nd of 3 access guards (middleware が 1st、API が 3rd)。
  // middleware を通り抜けたあとも server component で再検証する (defense-in-depth)。
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect("/national/login");
  const verified = await verifyToken(token, "session");
  if (!verified.ok) redirect("/national/login");

  const decision = await checkAccess(verified.payload.email);
  if (!decision.allowed) {
    redirect(`${redirectPathForDecision(decision)}?from=national&reason=${decision.reason}`);
  }

  const packs = listNationalPacks();

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "40px 20px 80px" }}>
      <header style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#2E5F9E", letterSpacing: "0.1em" }}>
          NATIONAL FORMS
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "8px 0 12px", color: "#1a1a1a" }}>
          全国統一様式 届出書 自動生成
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.9, color: "#444" }}>
          消防法施行規則別記様式および火災予防条例準拠様式の届出書本体を、入力フォームから
          Word形式で自動生成します。<strong>添付書類（編成表・平面図・契約書 等）は別途ご用意ください</strong>。
        </p>
      </header>

      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
        {packs.map((pack) => (
          <li key={pack.packName}>
            <Link
              href={`/national/${pack.packName}`}
              style={{
                display: "block",
                padding: "20px 24px",
                border: "1px solid #e0e0e0",
                borderRadius: 10,
                textDecoration: "none",
                color: "#1a1a1a",
                background: "#fff",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "#666", letterSpacing: "0.04em" }}>
                {pack.legalRef}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, margin: "4px 0 6px" }}>
                {pack.title}
              </div>
              {pack.summary && (
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, margin: 0 }}>
                  {pack.summary}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <p
        style={{
          marginTop: 40,
          padding: "14px 18px",
          background: "#f5f5f7",
          borderLeft: "3px solid #c7c7cc",
          fontSize: 13,
          color: "#444",
          lineHeight: 1.8,
        }}
      >
        本機能で生成する書類は届出書本体のみです。提出にあたっては所轄消防署で受理可否を必ずご確認ください。
        都市独自の様式・添付書類が必要な場合があります。
      </p>
    </div>
  );
}
