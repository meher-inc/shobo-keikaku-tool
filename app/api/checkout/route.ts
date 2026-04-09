// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // Save form data in Stripe metadata (max 500 chars per key, 50 keys)
    const metadata: Record<string, string> = {
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
              name: "消防計画 自動作成",
              description: `${formData.building_name} の消防計画をWordファイルで生成`,
            },
            unit_amount: 2980,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/?canceled=true`,
      metadata,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "決済セッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
