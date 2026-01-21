import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2 } from "lucide-react";
// import { supabase } from "@/integrations/supabase/client"; // Tạm ẩn vì demo không cần gọi server

interface SponsoredListingModalProps {
  storeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SponsoredListingModal({ storeId, open, onOpenChange }: SponsoredListingModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (plan: 'month' | 'year') => {
    setIsLoading(true);
    
    // --- DEMO MODE: BYPASS PAYMENT ---
    // Giả lập quá trình xử lý thanh toán mà không cần gọi PayOS/Stripe
    console.log(`[DEMO] Processing payment for store: ${storeId}, plan: ${plan}`);

    // Giả lập độ trễ mạng (1.5 giây) cho giống thật
    setTimeout(() => {
      setIsLoading(false);
      onOpenChange(false); // Đóng modal
      
      toast({
        title: "Đăng ký thành công (Chế độ Demo)",
        description: `Gói dịch vụ ${plan === 'month' ? 'Tháng' : 'Năm'} đã được kích hoạt cho cửa hàng!`,
        duration: 3000,
      });

      // Ở đây bạn có thể thêm logic cập nhật state local để hiển thị icon Premium ngay lập tức nếu muốn
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center font-bold">Nâng cấp Cửa hàng (Demo)</DialogTitle>
          <DialogDescription className="text-center text-lg">
            Chế độ Demo: Bấm chọn gói để xem hiệu ứng thành công ngay lập tức.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Gói Tháng */}
          <Card className="border-2 hover:border-primary/50 transition-colors relative cursor-pointer" onClick={() => handleSubscribe('month')}>
            <CardHeader>
              <CardTitle>Gói Tháng</CardTitle>
              <CardDescription>Linh hoạt, ngắn hạn</CardDescription>
              <div className="text-3xl font-bold mt-2">50.000đ<span className="text-sm font-normal text-muted-foreground">/tháng</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Vị trí ưu tiên trên bản đồ</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Icon cửa hàng nổi bật</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Hỗ trợ 24/7</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={(e) => { e.stopPropagation(); handleSubscribe('month'); }}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Đăng ký ngay
              </Button>
            </CardFooter>
          </Card>

          {/* Gói Năm */}
          <Card className="border-2 border-primary shadow-lg relative bg-primary/5 cursor-pointer" onClick={() => handleSubscribe('year')}>
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
              Phổ biến nhất
            </div>
            <CardHeader>
              <CardTitle>Gói Năm</CardTitle>
              <CardDescription>Tiết kiệm 20%</CardDescription>
              <div className="text-3xl font-bold mt-2">500.000đ<span className="text-sm font-normal text-muted-foreground">/năm</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Tất cả quyền lợi gói Tháng</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Tiết kiệm chi phí</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Huy hiệu "Đối tác uy tín"</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="default"
                onClick={(e) => { e.stopPropagation(); handleSubscribe('year'); }}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Đăng ký ngay
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
