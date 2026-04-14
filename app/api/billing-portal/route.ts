import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "../../../lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    // Resolve authenticated user from Supabase Auth cookie.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: "ログインが必要です" },
        { status: 401 }
      );
    }

    // Look up stripe_customer_id from subscriptions table.
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("customer_email", user.email)
      .not("stripe_customer_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json(
        { error: "サブスクリプションが見つかりません" },
        { status: 401 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://plan.todokede.jp";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appUrl}/mypage`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "unknown error";
    console.error("[billing-portal] error:", message);
    return NextResponse.json(
      { error: "処理に失敗しました: " + message },
      { status: 500 }
    );
  }
}
