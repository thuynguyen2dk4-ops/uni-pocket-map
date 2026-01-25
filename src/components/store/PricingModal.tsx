import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
// Đã thêm 'X' vào dòng import này
import { Check, Crown, Zap, X } from 'lucide-react';
import { toast } from 'sonner';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal = ({ isOpen, onClose }: PricingModalProps) => {

  const handleContactSupport = (plan: string) => {
    // Tích hợp Zalo/Messenger hoặc cổng thanh toán tại đây
    toast.info(`Bạn đã chọn gói ${plan}. Vui lòng liên hệ Admin để kích hoạt!`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-gray-50 p-6 rounded-2xl z-[150]">
        <DialogHeader className="mb-4 text-center">
          <DialogTitle className="text-2xl font-bold text-gray-900">Nâng cấp cửa hàng của bạn</DialogTitle>
          <p className="text-gray-500">Chọn gói dịch vụ phù hợp để tăng doanh thu</p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* GÓI MIỄN PHÍ */}
            <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col">
                <div className="mb-4">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">CƠ BẢN</span>
                    <h3 className="text-2xl font-bold mt-2">Miễn phí</h3>
                    <p className="text-sm text-gray-500">Trọn đời</p>
                </div>
                <ul className="space-y-3 mb-6 flex-1 text-sm text-gray-600">
                    <li className="flex gap-2"><Check className="w-4 h-4 text-green-500"/> Tên cửa hàng & SĐT</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-green-500"/> Ghim vị trí bản đồ</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-green-500"/> 1 Ảnh đại diện</li>
                    <li className="flex gap-2 text-gray-400 line-through"><X className="w-4 h-4"/> Quản lý Menu & Voucher</li>
                    <li className="flex gap-2 text-gray-400 line-through"><X className="w-4 h-4"/> Thư viện ảnh</li>
                </ul>
                <Button disabled variant="outline" className="w-full">Đang sử dụng</Button>
            </div>

            {/* GÓI VIP */}
            <div className="bg-white p-6 rounded-xl border-2 border-yellow-400 shadow-xl relative flex flex-col transform md:-translate-y-2">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                    <Crown className="w-3 h-3"/> KHUYÊN DÙNG
                </div>
                <div className="mb-4">
                    <h3 className="text-2xl font-bold mt-2 text-yellow-600">Gói VIP</h3>
                    <p className="text-sm text-gray-500">99.000đ / tháng</p>
                </div>
                <ul className="space-y-3 mb-6 flex-1 text-sm text-gray-700 font-medium">
                    <li className="flex gap-2"><Check className="w-4 h-4 text-yellow-500"/> Tất cả tính năng Free</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-yellow-500"/> <strong>Đăng Menu & Giá</strong></li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-yellow-500"/> <strong>Tạo Voucher khuyến mãi</strong></li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-yellow-500"/> Thêm mô tả chi tiết</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-yellow-500"/> Thư viện 10 ảnh</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-yellow-500"/> Huy hiệu VIP Partner</li>
                </ul>
                <Button onClick={() => handleContactSupport("VIP")} className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 border-0">
                    Nâng cấp ngay
                </Button>
            </div>

            {/* GÓI QUẢNG CÁO */}
            <div className="bg-gradient-to-b from-blue-50 to-white p-6 rounded-xl border border-blue-200 shadow-sm flex flex-col">
                <div className="mb-4">
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1"><Zap className="w-3 h-3"/> TĂNG TƯƠNG TÁC</span>
                    <h3 className="text-2xl font-bold mt-2 text-blue-700">Quảng cáo</h3>
                    <p className="text-sm text-gray-500">50.000đ / tuần</p>
                </div>
                <ul className="space-y-3 mb-6 flex-1 text-sm text-gray-600">
                    <li className="flex gap-2"><Check className="w-4 h-4 text-blue-500"/> <strong>Xuất hiện ở "Gợi ý hôm nay"</strong></li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-blue-500"/> Vị trí đầu tiên trong danh sách</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-blue-500"/> Chữ chạy nổi bật (Marquee)</li>
                    <li className="flex gap-2"><Check className="w-4 h-4 text-blue-500"/> Tiếp cận 10.000+ sinh viên</li>
                </ul>
                <Button onClick={() => handleContactSupport("Quảng Cáo")} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Mua Quảng cáo
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};