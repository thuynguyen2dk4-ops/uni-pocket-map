import { useEffect } from 'react';

interface GoogleAdProps {
  slotId: string; // ID của đơn vị quảng cáo lấy từ trang quản trị AdSense
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

/**
 * Thành phần hiển thị quảng cáo Google AdSense.
 * * Cách sử dụng:
 * 1. Đảm bảo đã dán mã script AdSense vào <head> của file index.html
 * 2. Lưu file này vào: frontend/src/components/ads/GoogleAd.tsx
 * 3. Import và sử dụng trong các trang khác như: <GoogleAd slotId="123456789" />
 */
export const GoogleAd = ({ slotId, format = 'auto', className }: GoogleAdProps) => {
  useEffect(() => {
    try {
      // Đẩy yêu cầu hiển thị quảng cáo vào hàng đợi của Google
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, [slotId]); // Gọi lại nếu slotId thay đổi

  return (
    <div className={`google-ad-container my-4 overflow-hidden flex justify-center ${className}`}>
      {/* LƯU Ý: Thay 'ca-pub-XXXXXXXXXXXXXXXX' bằng ID người xuất bản thật của bạn.
          ID này thường cố định cho toàn bộ trang web.
      */}
      <ins className="adsbygoogle"
           style={{ display: 'block', minWidth: '250px', minHeight: '90px' }}
           data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" 
           data-ad-slot={slotId}
           data-ad-format={format}
           data-full-width-responsive="true"></ins>
    </div>
  );
};