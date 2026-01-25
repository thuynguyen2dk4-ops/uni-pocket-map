// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @ts-ignore
import PayOSLib from "npm:@payos/node";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const verifiedData = body.data; 
    if (!verifiedData) throw new Error("No data");

    const { orderCode } = verifiedData;
    console.log(`Nhận thanh toán đơn: ${orderCode}`);

    // 1. Tìm Store có mã đơn hàng khớp
    const { data: store, error } = await supabase
      .from("user_stores")
      .select("id")
      .eq("last_order_code", orderCode)
      .maybeSingle();

    if (store) {
      console.log(`Kích hoạt Premium cho Store: ${store.id}`);
      
      // --- SỬA LOGIC Ở ĐÂY: DÙNG CỘT IS_PREMIUM ---
      await supabase.from("user_stores").update({
        is_premium: true, // <--- Đã sửa
        premium_expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // <--- Đã sửa
        last_order_code: null 
      }).eq("id", store.id);

    } else {
      // Logic cho Quảng cáo (Giữ nguyên)
      const { data: adRecord } = await supabase
        .from("sponsored_listings")
        .select("*")
        .eq("transaction_code", orderCode.toString())
        .maybeSingle();

      if (adRecord) {
        const now = new Date();
        const startDate = new Date(adRecord.start_date);
        const newStatus = (startDate <= now) ? 'active' : 'scheduled';
        await supabase.from("sponsored_listings")
          .update({ payment_status: 'paid', status: newStatus })
          .eq("id", adRecord.id);
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});