import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getNationalPack } from "@/lib/engine-v2/national/registry";
import { NationalForm } from "../_components/national-form";
import {
  SESSION_COOKIE_NAME,
  verifyToken,
} from "@/lib/session-token";
import { checkAccess, redirectPathForDecision } from "@/lib/national-access";

interface Props {
  params: Promise<{ docType: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { docType } = await params;
  const pack = getNationalPack(docType);
  if (!pack) return { title: "書類が見つかりません" };
  return {
    title: `${pack.title} 自動生成 ｜ トドケデ消防計画`,
    description: pack.summary ?? `${pack.title}（${pack.legalRef}）を自動生成します。`,
    robots: { index: false, follow: false },
  };
}

export default async function NationalDocPage({ params }: Props) {
  // 2nd of 3 access guards (middleware が 1st、API が 3rd)。
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect("/national/login");
  const verified = await verifyToken(token, "session");
  if (!verified.ok) redirect("/national/login");

  const decision = await checkAccess(verified.payload.email);
  if (!decision.allowed) {
    redirect(`${redirectPathForDecision(decision)}?from=national&reason=${decision.reason}`);
  }

  const { docType } = await params;
  const pack = getNationalPack(docType);
  if (!pack) notFound();

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 20px 80px" }}>
      <nav style={{ marginBottom: 24, fontSize: 13 }}>
        <Link href="/national" style={{ color: "#666", textDecoration: "none" }}>
          ← 全国統一様式 届出書 一覧
        </Link>
      </nav>

      <header style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#666", letterSpacing: "0.04em", margin: 0 }}>
          {pack.legalRef}
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: "6px 0 12px", color: "#1a1a1a" }}>
          {pack.title}
        </h1>
        {pack.summary && (
          <p style={{ fontSize: 14, lineHeight: 1.8, color: "#444", margin: 0 }}>
            {pack.summary}
          </p>
        )}
      </header>

      <NationalForm pack={pack} />

      <aside
        style={{
          marginTop: 32,
          padding: "14px 18px",
          background: "#f5f5f7",
          borderLeft: "3px solid #c7c7cc",
          fontSize: 13,
          color: "#444",
          lineHeight: 1.8,
        }}
      >
        生成される書類は届出書本体のみです。資格を証する書面、編成表、平面図、設計図書等の添付書類は
        別途ご準備いただき、所轄消防署の受理可否を必ずご確認ください。
      </aside>
    </div>
  );
}
