const crypto = require('crypto'); // Thư viện có sẵn của Node.js

// --- API: Tạo Link Thanh Toán PayOS ---
app.post('/api/payment/create-checkout', async (req, res) => {
  try {
    // 1. Lấy cấu hình PayOS
    const CLIENT_ID = process.env.PAYOS_CLIENT_ID;
    const API_KEY = process.env.PAYOS_API_KEY;
    const CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

    if (!CLIENT_ID || !API_KEY || !CHECKSUM_KEY) {
      return res.status(500).json({ error: "Thiếu cấu hình PayOS" });
    }

    const { storeId, type, packageType, returnUrl, cancelUrl } = req.body;
    if (!storeId) return res.status(400).json({ error: "Thiếu Store ID" });

    // 2. Tính tiền & Mã đơn hàng
    const orderCode = Number(String(Date.now()).slice(-9)); 
    let amount = 2000;
    let description = "";
    let pendingType = "";

    if (type === "vip") {
      amount = 100000;
      description = `VIP ${orderCode}`;
      pendingType = "vip_lifetime";
    } 
    else if (type === "ad") {
      if (packageType === 'month') {
        amount = 150000;
        description = `QC Thang ${orderCode}`;
        pendingType = "ad_month";
      } else {
        amount = 50000;
        description = `QC Tuan ${orderCode}`;
        pendingType = "ad_week";
      }
    }

    console.log(`[PAYMENT] Đơn hàng: ${orderCode} | Store: ${storeId} | Gói: ${pendingType}`);

  
    await pool.query(
      `UPDATE user_stores 
       SET last_order_code = $1, pending_package_type = $2 
       WHERE id = $3`,
      [orderCode, pendingType, storeId]
    );

    // 4. Tạo chữ ký (Signature)
    const signData = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
    const hmac = crypto.createHmac("sha256", CHECKSUM_KEY);
    hmac.update(signData);
    const signature = hmac.digest("hex");

    // 5. Gọi API PayOS
    const payload = {
      orderCode,
      amount,
      description,
      buyerName: "User", 
      buyerEmail: "user@example.com", 
      cancelUrl,
      returnUrl,
      signature,
      items: [{ name: description, quantity: 1, price: amount }]
    };

    const response = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CLIENT_ID,
        "x-api-key": API_KEY
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || result.code !== "00") {
      throw new Error(result.desc || "Lỗi PayOS");
    }

    // Trả về kết quả
    res.json({ checkoutUrl: result.data.checkoutUrl });

  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ error: error.message || "Lỗi server" });
  }
});