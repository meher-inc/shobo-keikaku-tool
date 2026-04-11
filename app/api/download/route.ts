// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "支払いが完了していません" }, { status: 400 });
    }

    // Reconstruct form data from metadata
    const meta = session.metadata || {};
    const formData = {
      plan: meta.plan,
      building_name: meta.building_name,
      prefecture: meta.prefecture,
      city: meta.city,
      ward: meta.ward,
      address_detail: meta.address_detail,
      use_category: meta.use_category,
      total_area: meta.total_area,
      num_floors: meta.num_floors,
      capacity: meta.capacity,
      owner_name: meta.owner_name,
      manager_name: meta.manager_name,
      manager_qual: meta.manager_qual,
      manager_date: meta.manager_date,
      manager_tel: meta.manager_tel,
      has_outsource: meta.has_outsource === "true",
      outsource_company: meta.outsource_company,
      equipment: JSON.parse(meta.equipment || "[]"),
      inspection_company: meta.inspection_company,
      security_company: meta.security_company,
      emergency_name: meta.emergency_name,
      emergency_tel: meta.emergency_tel,
      evacuation_site: meta.evacuation_site,
      assembly_point: meta.assembly_point,
      drill_months: meta.drill_months,
      education_months: meta.education_months,
    };

    // Call the generate-plan API internally
    const generateRes = await fetch(`${request.nextUrl.origin}/api/generate-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!generateRes.ok) {
      return NextResponse.json({ error: "生成に失敗しました" }, { status: 500 });
    }

    const buffer = await generateRes.arrayBuffer();
    const filename = encodeURIComponent(`消防計画_${meta.building_name}.docx`);

    // Best-effort download tracking. Failure must never block the DL.
    try {
      const { data: orderRow, error: fetchErr } = await supabaseAdmin
        .from("orders")
        .select("id, download_count")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();
      if (fetchErr) {
        console.error("[download] supabase lookup error:", fetchErr);
      } else if (orderRow) {
        const { error: updateErr } = await supabaseAdmin
          .from("orders")
          .update({
            download_count: (orderRow.download_count || 0) + 1,
            last_downloaded_at: new Date().toISOString(),
          })
          .eq("id", orderRow.id);
        if (updateErr) {
          console.error("[download] supabase update error:", updateErr);
        }
      }
    } catch (trackErr) {
      console.error("[download] tracking error:", trackErr);
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename*=UTF-8''${filename}`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "ダウンロードに失敗しました" }, { status: 500 });
  }
}
