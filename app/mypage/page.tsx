"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

interface SubscriptionRow {
  plan_id: string;
  stripe_price_id: string;
  status: string;
  current_period_end: string | null;
  billing_cycle: string;
}

const STATUS_LABEL: Record<string, string> = {
  active: "有効",
  past_due: "支払い遅延",
  canceled: "解約済み",
  incomplete: "処理中",
  unpaid: "未払い",
  trialing: "トライアル中",
  paused: "一時停止中",
};

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function planName(row: SubscriptionRow): string {
  const pid = row.stripe_price_id || "";
  if (pid.includes("STANDARD") || row.plan_id === "standard") return "スタンダード";
  return "ミニマム";
}

const card = {
  maxWidth: 480,
  margin: "48px auto",
  background: "#fff",
  borderRadius: 12,
  padding: 32,
  border: "1px solid #e5e5e7",
};
const btn = {
  display: "block" as const,
  width: "100%",
  padding: "14px 0",
  background: "#E8332A",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: 600 as const,
  fontSize: 15,
  cursor: "pointer" as const,
};

export default function MyPage() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth state
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  if (loading) {
    return (
      <div style={{ ...card, textAlign: "center" }}>
        <p style={{ color: "#666" }}>読み込み中...</p>
      </div>
    );
  }

  if (!user) return <LoginForm />;
  return <Dashboard user={user} />;
}

// ── Login Form ──────────────────────────────────────────────────

function LoginForm() {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSubmitting(true);
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/mypage`
          : "https://plan.todokede.jp/mypage";
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      setSubmitting(false);
      if (authError) {
        setError(authError.message);
      } else {
        setSent(true);
      }
    },
    [email, supabase]
  );

  return (
    <div style={card}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#1A1A1A" }}>
        マイページ
      </h1>
      <p style={{ fontSize: 14, color: "#666", marginBottom: 24 }}>
        ご登録のメールアドレスにログインリンクをお送りします。
      </p>

      {sent ? (
        <div
          style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 8,
            padding: "16px 20px",
            fontSize: 14,
            color: "#166534",
          }}
        >
          メールを送信しました。リンクをクリックしてログインしてください。
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "#1A1A1A" }}>
            メールアドレス
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@company.co.jp"
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontSize: 15,
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />
          {error && (
            <p style={{ color: "#E8332A", fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}
          <button type="submit" disabled={submitting} style={{ ...btn, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "送信中..." : "ログインリンクを送る"}
          </button>
        </form>
      )}
    </div>
  );
}

// ── Dashboard ───────────────────────────────────────────────────

function Dashboard({ user }: { user: User }) {
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );
  const [sub, setSub] = useState<SubscriptionRow | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("subscriptions")
        .select("plan_id, stripe_price_id, status, current_period_end, billing_cycle")
        .eq("customer_email", user.email)
        .in("status", ["active", "past_due", "trialing", "incomplete"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setSub(data);
      setSubLoading(false);
    }
    load();
  }, [user.email, supabase]);

  const handlePortal = useCallback(async () => {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/billing-portal", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "エラーが発生しました");
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      alert(err instanceof Error ? err.message : "エラーが発生しました");
      setPortalLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/mypage";
  }, [supabase]);

  return (
    <div style={card}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4, color: "#1A1A1A" }}>
        マイページ
      </h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>
        {user.email}
      </p>

      {subLoading ? (
        <p style={{ color: "#666", fontSize: 14 }}>契約情報を取得中...</p>
      ) : sub ? (
        <div style={{ marginBottom: 24 }}>
          <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "10px 0", color: "#666", fontWeight: 600 }}>プラン</td>
                <td style={{ padding: "10px 0", textAlign: "right", color: "#1A1A1A" }}>
                  {planName(sub)}
                </td>
              </tr>
              <tr style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 0", color: "#666", fontWeight: 600 }}>ステータス</td>
                <td style={{ padding: "10px 0", textAlign: "right", color: "#1A1A1A" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: 12,
                      fontSize: 13,
                      fontWeight: 600,
                      background: sub.status === "active" ? "#dcfce7" : sub.status === "past_due" ? "#fef9c3" : "#f3f4f6",
                      color: sub.status === "active" ? "#166534" : sub.status === "past_due" ? "#854d0e" : "#374151",
                    }}
                  >
                    {STATUS_LABEL[sub.status] || sub.status}
                  </span>
                </td>
              </tr>
              <tr style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 0", color: "#666", fontWeight: 600 }}>次回請求日</td>
                <td style={{ padding: "10px 0", textAlign: "right", color: "#1A1A1A" }}>
                  {formatDate(sub.current_period_end)}
                </td>
              </tr>
            </tbody>
          </table>

          <button
            onClick={handlePortal}
            disabled={portalLoading}
            style={{ ...btn, marginTop: 24, opacity: portalLoading ? 0.7 : 1 }}
          >
            {portalLoading ? "処理中..." : "プラン変更・解約・支払い方法の変更"}
          </button>
        </div>
      ) : (
        <div
          style={{
            background: "#f9fafb",
            borderRadius: 8,
            padding: "20px",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
            有効なサブスクリプションが見つかりません。
          </p>
          <a
            href="/pricing"
            style={{
              display: "inline-block",
              marginTop: 12,
              color: "#E8332A",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            プランを選ぶ
          </a>
        </div>
      )}

      <button
        onClick={handleLogout}
        style={{
          display: "block",
          width: "100%",
          padding: "12px 0",
          background: "transparent",
          color: "#666",
          border: "1px solid #d1d5db",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        ログアウト
      </button>
    </div>
  );
}
