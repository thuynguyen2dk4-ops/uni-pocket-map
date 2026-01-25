import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Store, Edit2, Trash2, UtensilsCrossed, Tag, ChevronDown, ChevronUp, MapPin, Lock, Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { useUserStores, UserStore, StoreMenuItem, StoreVoucher } from '@/hooks/useUserStores';
import { StoreFormModal } from './StoreFormModal';
import { MenuItemForm } from './MenuItemForm'; 
import { VoucherForm } from './VoucherForm';   
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client'; // Thêm import supabase để thanh toán

interface StoreManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick?: () => void;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-600',
  approved: 'bg-green-500/20 text-green-600',
  rejected: 'bg-red-500/20 text-red-600',
};

const STATUS_LABELS = {
  pending: { vi: 'Chờ duyệt', en: 'Pending' },
  approved: { vi: 'Đã duyệt', en: 'Approved' },
  rejected: { vi: 'Từ chối', en: 'Rejected' },
};

export const StoreManagementPanel = ({ isOpen, onClose, onLoginClick }: StoreManagementPanelProps) => {
  const { language } = useLanguage();
  const { session } = useAuth(); 
  
  const { 
    stores, isLoading, fetchStores, 
    deleteStore, 
    fetchMenuItems, fetchVouchers, deleteMenuItem, deleteVoucher 
  } = useUserStores();
  
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [editingStore, setEditingStore] = useState<UserStore | null>(null);
  
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'voucher'>('menu');
  
  const [menuItems, setMenuItems] = useState<StoreMenuItem[]>([]);
  const [vouchers, setVouchers] = useState<StoreVoucher[]>([]);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<StoreMenuItem | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<StoreVoucher | null>(null);
  
  const [isUpgrading, setIsUpgrading] = useState(false); // State loading khi bấm mua

  useEffect(() => {
    if (expandedStoreId) {
      loadStoreDetails(expandedStoreId);
    }
  }, [expandedStoreId]);

  const loadStoreDetails = async (storeId: string) => {
    const [items, voucherList] = await Promise.all([
      fetchMenuItems(storeId),
      fetchVouchers(storeId),
    ]);
    setMenuItems(items);
    setVouchers(voucherList);
  };

  const handleStoreSubmit = async (formData: any) => {
    try {
      await fetchStores(); 
    } catch (e) {
      console.error(e);
    }
    setShowStoreForm(false);
    setEditingStore(null);
  };

  const handleDeleteStore = async (storeId: string) => {
    if (confirm(language === 'vi' ? 'Bạn có chắc muốn xóa cửa hàng này?' : 'Are you sure you want to delete this store?')) {
      await deleteStore(storeId);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (confirm(language === 'vi' ? 'Xóa món này?' : 'Delete this item?')) {
      await deleteMenuItem(itemId);
      if (expandedStoreId) loadStoreDetails(expandedStoreId); 
    }
  };

  const handleDeleteVoucher = async (voucherId: string) => {
    if (confirm(language === 'vi' ? 'Xóa voucher này?' : 'Delete this voucher?')) {
      await deleteVoucher(voucherId);
      if (expandedStoreId) loadStoreDetails(expandedStoreId); 
    }
  };
  
  // --- HÀM XỬ LÝ THANH TOÁN NGAY TẠI ĐÂY ---
  const handleUpgradeStore = async (storeId: string) => {
    setIsUpgrading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          storeId: storeId,
          type: 'vip',
          categoryId: 1, 
          returnUrl: window.location.href,
          cancelUrl: window.location.href
        }
      });

      if (error) throw error;
      if (data && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Không lấy được link thanh toán");
      }
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsUpgrading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-transparent pointer-events-none"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 shadow-2xl flex flex-col bg-white"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            {language === 'vi' ? 'Cửa hàng của tôi' : 'My Stores'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {!session ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-muted-foreground mb-4">
                {language === 'vi' ? 'Đăng nhập để quản lý cửa hàng' : 'Login to manage your stores'}
              </p>
              <Button onClick={onLoginClick}>
                {language === 'vi' ? 'Đăng nhập' : 'Login'}
              </Button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-muted-foreground mb-4">
                {language === 'vi' ? 'Bạn chưa có cửa hàng nào' : 'You don\'t have any stores yet'}
              </p>
              <Button onClick={() => setShowStoreForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {language === 'vi' ? 'Thêm cửa hàng' : 'Add Store'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {stores.map(store => {
                // Kiểm tra trạng thái VIP
                const isPremium = (store as any).is_premium === true;

                return (
                <div key={store.id} className="border bg-white rounded-xl overflow-hidden shadow-sm relative">
                  
                  {isPremium && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10 flex items-center gap-1">
                          <Crown className="w-3 h-3 fill-yellow-900" /> VIP
                      </div>
                  )}

                  <div className="p-4">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 flex-shrink-0">
                        {store.image_url ? (
                            <img 
                              src={store.image_url} 
                              alt={store.name_vi} 
                              className="w-full h-full rounded-lg object-cover border"
                              onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=No+Img"; }}
                            />
                        ) : (
                            <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center border">
                              <Store className="w-6 h-6 text-gray-400" />
                            </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold truncate text-gray-900 pr-8">
                            {language === 'en' && store.name_en ? store.name_en : store.name_vi}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                             <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${STATUS_COLORS[store.status as keyof typeof STATUS_COLORS]}`}>
                                {STATUS_LABELS[store.status as keyof typeof STATUS_LABELS]?.[language] || store.status}
                             </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{language === 'en' && store.address_en ? store.address_en : store.address_vi}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingStore(store);
                          setShowStoreForm(true);
                        }}
                        className="flex-1 h-8 text-xs"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        {language === 'vi' ? 'Sửa' : 'Edit'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStore(store.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedStoreId(expandedStoreId === store.id ? null : store.id)}
                        className="h-8 w-8 p-0"
                      >
                        {expandedStoreId === store.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedStoreId === store.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t bg-gray-50"
                      >
                        <div className="flex border-b bg-white">
                          <button
                            onClick={() => setActiveTab('menu')}
                            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                              activeTab === 'menu' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-800'
                            }`}
                          >
                            <UtensilsCrossed className="w-4 h-4" />
                            Menu ({menuItems.length})
                          </button>
                          <button
                            onClick={() => setActiveTab('voucher')}
                            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                              activeTab === 'voucher' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-800'
                            }`}
                          >
                            <Tag className="w-4 h-4" />
                            Voucher ({vouchers.length})
                          </button>
                        </div>

                        <div className="p-4">
                          {activeTab === 'menu' ? (
                            <>
                              <AnimatePresence>
                                {showMenuForm && (
                                  <MenuItemForm
                                    storeId={store.id}
                                    item={editingMenuItem}
                                    onClose={() => {
                                      setShowMenuForm(false);
                                      setEditingMenuItem(null);
                                    }}
                                    onSuccess={() => loadStoreDetails(store.id)}
                                  />
                                )}
                              </AnimatePresence>

                              {/* --- KIỂM TRA VIP CHO MENU --- */}
                              {!showMenuForm && (
                                isPremium ? (
                                    <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowMenuForm(true)}
                                    className="w-full mb-3 bg-white border-dashed border-2 hover:border-primary hover:text-primary"
                                    >
                                    <Plus className="w-4 h-4 mr-1" />
                                    {language === 'vi' ? 'Thêm món mới' : 'Add Item'}
                                    </Button>
                                ) : (
                                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                                        <Lock className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                                        <p className="text-xs font-medium text-yellow-800 mb-2">Tính năng Menu chỉ dành cho VIP</p>
                                        <Button size="sm" onClick={() => handleUpgradeStore(store.id)} disabled={isUpgrading} className="bg-yellow-500 hover:bg-yellow-600 text-white w-full">
                                            {isUpgrading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crown className="w-3 h-3 mr-1" />}
                                            Nâng cấp ngay (5.000đ)
                                        </Button>
                                    </div>
                                )
                              )}

                              <div className="space-y-2">
                                {menuItems.map(item => (
                                  <div key={item.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border shadow-sm">
                                    <img 
                                      src={item.image_url || 'https://placehold.co/100x100?text=Food'} 
                                      alt={item.name_vi} 
                                      className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                                      onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=Food"; }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate text-gray-900">
                                        {language === 'en' && item.name_en ? item.name_en : item.name_vi}
                                      </p>
                                      <p className="text-xs text-primary font-bold">{formatPrice(item.price)}</p>
                                    </div>
                                    <div className="flex gap-1">
                                      <button onClick={() => { setEditingMenuItem(item); setShowMenuForm(true); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button onClick={() => handleDeleteMenuItem(item.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <>
                              <AnimatePresence>
                                {showVoucherForm && (
                                  <VoucherForm
                                    storeId={store.id}
                                    voucher={editingVoucher}
                                    onClose={() => {
                                      setShowVoucherForm(false);
                                      setEditingVoucher(null);
                                    }}
                                    onSuccess={() => loadStoreDetails(store.id)}
                                  />
                                )}
                              </AnimatePresence>

                              {/* --- KIỂM TRA VIP CHO VOUCHER --- */}
                              {!showVoucherForm && (
                                isPremium ? (
                                    <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowVoucherForm(true)}
                                    className="w-full mb-3 bg-white border-dashed border-2 hover:border-primary hover:text-primary"
                                    >
                                    <Plus className="w-4 h-4 mr-1" />
                                    {language === 'vi' ? 'Tạo voucher mới' : 'Create Voucher'}
                                    </Button>
                                ) : (
                                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                                        <Lock className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                                        <p className="text-xs font-medium text-yellow-800 mb-2">Tính năng Voucher chỉ dành cho VIP</p>
                                        <Button size="sm" onClick={() => handleUpgradeStore(store.id)} disabled={isUpgrading} className="bg-yellow-500 hover:bg-yellow-600 text-white w-full">
                                            {isUpgrading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crown className="w-3 h-3 mr-1" />}
                                            Nâng cấp ngay (5.000đ)
                                        </Button>
                                    </div>
                                )
                              )}

                              <div className="space-y-2">
                                {vouchers.map(voucher => (
                                  <div key={voucher.id} className="p-3 bg-white rounded-lg border border-dashed border-primary/30">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                                            {voucher.code}
                                          </span>
                                        </div>
                                        <p className="text-sm font-medium mt-1 text-gray-900">
                                          {language === 'en' && voucher.title_en ? voucher.title_en : voucher.title_vi}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Giảm: {voucher.discount_type === 'percent' 
                                            ? `${voucher.discount_value}%` 
                                            : formatPrice(voucher.discount_value)
                                          }
                                        </p>
                                      </div>
                                      <div className="flex gap-1">
                                        <button onClick={() => { setEditingVoucher(voucher); setShowVoucherForm(true); }} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => handleDeleteVoucher(voucher.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )})}

              <Button onClick={() => setShowStoreForm(true)} className="w-full shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                {language === 'vi' ? 'Thêm cửa hàng mới' : 'Add New Store'}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      <StoreFormModal
        isOpen={showStoreForm}
        onClose={() => {
          setShowStoreForm(false);
          setEditingStore(null);
        }}
        initialData={editingStore}
        onSubmit={handleStoreSubmit}
        isSubmitting={isLoading}
        // Truyền hàm nâng cấp cho Form sửa dùng luôn
        onUpgradeClick={() => {
            // Đóng form lại để hiện Popup thanh toán (nếu cần) hoặc chuyển trang
            // Nếu muốn giữ form mở thì bỏ dòng setShowStoreForm(false) đi
            if(editingStore) {
                // Gọi hàm thanh toán đã viết ở trên
                handleUpgradeStore(editingStore.id); 
            } else {
                alert("Vui lòng lưu cửa hàng trước khi nâng cấp!");
            }
        }}
      />
    </>
  );
};