import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminStore } from '@/hooks/useAdminStores';
import { StoreMenuItem, StoreVoucher } from '@/hooks/useUserStores';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, Clock, UtensilsCrossed, Ticket, Info, CalendarDays } from 'lucide-react';
// Đã xóa import Mapbox và CSS để giảm nhẹ file

interface StoreDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: AdminStore | null;
}

export const StoreDetailModal = ({ isOpen, onClose, store }: StoreDetailModalProps) => {
  const [menuItems, setMenuItems] = useState<StoreMenuItem[]>([]);
  const [vouchers, setVouchers] = useState<StoreVoucher[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Format ngày tháng kiểu Việt Nam (Ví dụ: 20:30 22/01/2026)
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Không rõ';
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  useEffect(() => {
    if (store && isOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        // 1. Lấy Menu
        const { data: menu } = await supabase
          .from('store_menu_items')
          .select('*')
          .eq('store_id', store.id);
        
        // 2. Lấy Voucher
        const { data: voucherList } = await supabase
          .from('store_vouchers')
          .select('*')
          .eq('store_id', store.id);

        setMenuItems(menu || []);
        setVouchers(voucherList || []);
        setIsLoading(false);
      };
      fetchData();
    }
  }, [store, isOpen]);

  if (!store) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {store.name_vi}
            <Badge variant={store.status === 'approved' ? 'default' : store.status === 'rejected' ? 'destructive' : 'secondary'}>
              {store.status === 'approved' ? 'Đã duyệt' : store.status === 'rejected' ? 'Bị từ chối' : 'Chờ duyệt'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3"> {/* Đổi thành 3 cột vì bỏ tab Map */}
            <TabsTrigger value="info"><Info className="w-4 h-4 mr-2"/> Thông tin</TabsTrigger>
            <TabsTrigger value="menu"><UtensilsCrossed className="w-4 h-4 mr-2"/> Menu ({menuItems.length})</TabsTrigger>
            <TabsTrigger value="voucher"><Ticket className="w-4 h-4 mr-2"/> Voucher ({vouchers.length})</TabsTrigger>
          </TabsList>

          {/* TAB 1: THÔNG TIN CƠ BẢN (Đã thêm ngày tạo) */}
          <TabsContent value="info" className="space-y-4 py-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <img 
                  src={store.image_url || 'https://placehold.co/600x400?text=Store'} 
                  alt="Store" 
                  className="w-full h-64 object-cover rounded-xl shadow-sm border"
                  onError={(e) => { e.currentTarget.src = "https://placehold.co/600x400?text=No+Image"; }}
                />
              </div>
              <div className="space-y-4 text-sm">
                
                {/* --- PHẦN MỚI: NGÀY TẠO --- */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                  <CalendarDays className="w-5 h-5"/> 
                  <div>
                    <span className="font-bold block text-xs uppercase opacity-70">Ngày tạo cửa hàng</span>
                    <span className="font-bold text-base">{formatDate(store.created_at)}</span>
                  </div>
                </div>
                {/* ------------------------- */}

                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                  <Phone className="w-4 h-4 text-gray-500"/> 
                  <span className="font-medium text-gray-500">SĐT:</span> {store.phone || 'Chưa cập nhật'}
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                  <Mail className="w-4 h-4 text-gray-500"/> 
                  <span className="font-medium text-gray-500">Email chủ:</span> {store.user_email}
                </div>
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-100">
                  <Clock className="w-4 h-4 text-gray-500"/> 
                  <span className="font-medium text-gray-500">Giờ mở cửa:</span> {store.open_hours_vi || 'N/A'}
                </div>
                
                <div className="border p-4 rounded-lg bg-gray-50">
                   <p className="font-bold mb-2 text-gray-700">Mô tả:</p>
                   <p className="text-gray-600 leading-relaxed">{store.description_vi || 'Không có mô tả'}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: MENU */}
          <TabsContent value="menu" className="py-4">
            {isLoading ? <div className="text-center py-4">Đang tải menu...</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {menuItems.length === 0 && <p className="text-gray-500 italic col-span-full text-center py-8">Cửa hàng chưa đăng món ăn nào.</p>}
                {menuItems.map(item => (
                  <div key={item.id} className="flex gap-3 p-3 border rounded-lg bg-white hover:shadow-sm transition-all">
                    <img 
                      src={item.image_url || 'https://placehold.co/100x100?text=Food'} 
                      className="w-16 h-16 rounded object-cover bg-gray-100"
                      onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=Food"; }}
                    />
                    <div>
                      <p className="font-bold text-gray-800">{item.name_vi}</p>
                      <p className="text-primary font-bold">{new Intl.NumberFormat('vi-VN').format(item.price)}đ</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{item.description_vi}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: VOUCHER */}
          <TabsContent value="voucher" className="py-4">
             {isLoading ? <div className="text-center py-4">Đang tải voucher...</div> : (
              <div className="space-y-3">
                {vouchers.length === 0 && <p className="text-gray-500 italic text-center py-8">Chưa có mã giảm giá nào.</p>}
                {vouchers.map(v => (
                  <div key={v.id} className="flex justify-between items-center p-4 border border-dashed border-primary/40 bg-primary/5 rounded-xl">
                    <div className="flex gap-3 items-center">
                      <Ticket className="w-8 h-8 text-primary opacity-50" />
                      <div>
                        <p className="font-bold text-lg text-primary">{v.code}</p>
                        <p className="font-medium text-sm">{v.title_vi}</p>
                        <p className="text-xs text-gray-500">Giảm: {v.discount_value}{v.discount_type === 'percent' ? '%' : 'đ'}</p>
                      </div>
                    </div>
                    <Badge variant={v.is_active ? 'default' : 'destructive'}>
                      {v.is_active ? 'Đang chạy' : 'Đã dừng'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};