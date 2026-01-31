// --- API: Tạo Link Thanh Toán PayOS (Thay thế Edge Function) ---
app.post('/api/payment/create-checkout', async (req, res) => {
  try {
    // 1. Lấy cấu hình từ biến môi trường
    const CLIENT_ID = process.env.PAYOS_CLIENT_ID;
    const API_KEY = process.env.PAYOS_API_KEY;
    const CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY;

    if (!CLIENT_ID || !API_KEY || !CHECKSUM_KEY) {
      return res.status(500).json({ error: "Thiếu cấu hình PayOS trong .env" });
    }

    const { storeId, type, packageType, returnUrl, cancelUrl } = req.body;
    if (!storeId) return res.status(400).json({ error: "Thiếu Store ID" });

    // 2. Tạo mã đơn hàng & Tính tiền
    const orderCode = Number(String(Date.now()).slice(-9)); // Mã số ngẫu nhiên
    let amount = 2000;
    let description = "";

    // Logic giá tiền (Khớp với code cũ của bạn)
    if (type === "vip") {
      amount = 100000; // Giá VIP
      description = `VIP ${orderCode}`;
    } 
    else if (type === "ad") {
      if (packageType === 'month') {
        amount = 150000; // QC Tháng
        description = `QC Thang ${orderCode}`;
      } else {
        amount = 50000;  // QC Tuần
        description = `QC Tuan ${orderCode}`;
      }
    }

    // 3. Cập nhật mã đơn hàng vào Database (Thay vì dùng Supabase SDK)
    // Lưu last_order_code để sau này Webhook biết đơn hàng này của Shop nào
    await pool.query(
      `UPDATE user_stores SET last_order_code = $1 WHERE id = $2`,
      [orderCode, storeId]
    );

    // 4. Tạo Signature (HMAC SHA256)
    // PayOS yêu cầu sắp xếp các trường theo alphabets để ký
    const signData = `amount=${amount}&cancelUrl=${cancelUrl}&description=${description}&orderCode=${orderCode}&returnUrl=${returnUrl}`;
    
    const hmac = crypto.createHmac("sha256", CHECKSUM_KEY);
    hmac.update(signData);
    const signature = hmac.digest("hex");

    // 5. Gọi API PayOS tạo link checkout
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
      throw new Error(result.desc || "Lỗi tạo thanh toán PayOS");
    }

    // Trả về link thanh toán cho Frontend
    res.json({ checkoutUrl: result.data.checkoutUrl });

  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ error: error.message });
  }
});