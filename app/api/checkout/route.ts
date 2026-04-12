// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const PLAN_CONFIG: Record<string, { price: number; name: string; description: string }> = {
  light: {
    price: 4980,
    name: "トドケデ消防計画（ライト）",
    description: "消防計画Word出力",
  },
  standard: {
    price: 9800,
    name: "トドケデ消防計画（スタンダード）",
    description: "消防計画＋別表すべて＋記入ガイドPDF付き",
  },
  premium: {
    price: 29800,
    name: "トドケデ消防計画（プレミアム）",
    description: "消防計画＋別表＋記入ガイド＋元消防士による内容チェック＋修正1回",
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    const planId = formData.plan || "standard";
    const plan = PLAN_CONFIG[planId] || PLAN_CONFIG.standard;

    // Insert a pending order row in Supabase BEFORE creating the Stripe session.
    // The Stripe webhook later flips this row to status='paid'.
    // The existing metadata-based flow is preserved as a fallback.
    const { data: orderRow, error: insertError } = await supabaseAdmin
      .from("orders")
      .insert({
        plan_id: planId,
        amount: plan.price,
        currency: "jpy",
        form_data: formData,
        status: "pending",
      })
      .select("id")
      .single();

    if (insertError || !orderRow) {
      console.error("[checkout] supabase insert error:", insertError);
      return NextResponse.json(
        { error: "注文の作成に失敗しました" },
        { status: 500 }
      );
    }

    const orderId = orderRow.id;

    const metadata: Record<string, string> = {
      order_id: orderId,
      plan: planId,
      building_name: formData.building_name || "",
      prefecture: formData.prefecture || "",
      city: formData.city || "",
      ward: formData.ward || "",
      address_detail: formData.address_detail || "",
      use_category: formData.use_category || "",
      total_area: String(formData.total_area || ""),
      num_floors: String(formData.num_floors || ""),
      capacity: String(formData.capacity || ""),
      owner_name: formData.owner_name || "",
      manager_name: formData.manager_name || "",
      manager_qual: formData.manager_qual || "",
      manager_date: formData.manager_date || "",
      manager_tel: formData.manager_tel || "",
      has_outsource: String(formData.has_outsource || false),
      outsource_company: formData.outsource_company || "",
      equipment: JSON.stringify(formData.equipment || []),
      inspection_company: formData.inspection_company || "",
      security_company: formData.security_company || "",
      emergency_name: formData.emergency_name || "",
      emergency_tel: formData.emergency_tel || "",
      evacuation_site: formData.evacuation_site || "",
      assembly_point: formData.assembly_point || "",
      drill_months: formData.drill_months || "",
      education_months: formData.education_months || "",
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "jpy",
            product_data: {
              name: plan.name,
              description: `${formData.building_name} — ${plan.description}`,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${request.nextUrl.origin}/?canceled=true`,
      metadata,
    });

    // Persist the Stripe session id back onto the order for later lookup.
    // Failure here is non-fatal: the webhook can still match via metadata.order_id.
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", orderId);
    if (updateError) {
      console.error("[checkout] supabase update stripe_session_id failed:", updateError);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "決済セッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
