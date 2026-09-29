// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "../../../lib/supabase";
import { getInternalSessionEmail } from "../../../lib/internal-session";
import { normalizeAccessEmail } from "../../../lib/internal-access";
import {
  GENERATE_AUTH_HEADER,
  getGenerateAuthorizationSecret,
} from "../../../lib/generate-authorization";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("session_id");
    const internalOrderId = request.nextUrl.searchParams.get("internal_order_id");

    if (!sessionId && !internalOrderId) {
      return NextResponse.json(
        { error: "session_id or internal_order_id is required" },
        { status: 400 }
      );
    }

    let meta: Record<string, string> = {};
    let orderRow:
      | {
          id: string;
          download_count: number | null;
          form_data: Record<string, unknown> | null;
          plan_id?: string | null;
          status?: string | null;
          amount?: number | null;
          customer_email?: string | null;
        }
      | null = null;

    let formData: Record<string, unknown>;

    if (internalOrderId) {
      const internalEmail = await getInternalSessionEmail(request);
      if (!internalEmail) {
        return NextResponse.json(
          { error: "社内利用にはログインが必要です" },
          { status: 401 }
        );
      }

      const { data, error } = await supabaseAdmin
        .from("orders")
        .select(
          "id, download_count, form_data, plan_id, status, amount, customer_email"
        )
        .eq("id", internalOrderId)
        .maybeSingle();

      if (error) {
        console.error("[download] internal order lookup error:", error);
        return NextResponse.json({ error: "注文の取得に失敗しました" }, { status: 500 });
      }
      if (!data) {
        return NextResponse.json({ error: "注文が見つかりません" }, { status: 404 });
      }

      const orderEmail =
        typeof data.customer_email === "string"
          ? normalizeAccessEmail(data.customer_email)
          : "";

      if (
        data.status !== "paid" ||
        Number(data.amount) !== 0 ||
        orderEmail !== internalEmail
      ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      orderRow = data;
      formData = {
        ...(data.form_data || {}),
        plan: data.plan_id || data.form_data?.plan || "standard",
      };
    } else {
      const session = await stripe.checkout.sessions.retrieve(sessionId!);

      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "支払いが完了していません" }, { status: 400 });
      }

      meta = (session.metadata || {}) as Record<string, string>;

      // 入力の正本は Supabase orders.form_data（checkout が full JSON を保存）。
      // Stripe metadata は一部項目しか持たず、自衛消防隊・各階配置などの新規項目が
      // 欠落するため、form_data を優先する。取得できない（旧データ等）場合に限り、
      // 従来どおり metadata から再構築してフォールバックする。
      try {
        const { data, error } = await supabaseAdmin
          .from("orders")
          .select("id, download_count, form_data")
          .eq("stripe_session_id", sessionId)
          .maybeSingle();
        if (error) {
          console.error("[download] supabase form_data lookup error:", error);
        } else if (data) {
          orderRow = data;
        }
      } catch (lookupErr) {
        console.error("[download] form_data lookup threw:", lookupErr);
      }

      formData =
        orderRow?.form_data && Object.keys(orderRow.form_data).length > 0
          ? orderRow.form_data
          : {
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
    }

    // Call the protected generate-plan API internally.
    const generateRes = await fetch(`${request.nextUrl.origin}/api/generate-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [GENERATE_AUTH_HEADER]: getGenerateAuthorizationSecret(),
      },
      body: JSON.stringify(formData),
    });

    if (!generateRes.ok) {
      const errText = await generateRes.text().catch(() => "");
      console.error("[download] generate-plan failed:", generateRes.status, errText.slice(0, 200));
      return NextResponse.json({ error: "生成に失敗しました" }, { status: 500 });
    }

    const buffer = await generateRes.arrayBuffer();
    const buildingName =
      (formData as Record<string, unknown>).building_name || meta.building_name || "消防計画";
    const filename = encodeURIComponent(`消防計画_${buildingName}.docx`);

    // Best-effort download tracking. Failure must never block the DL.
    try {
      if (orderRow) {
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
