import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Store, Edit2, Trash2, UtensilsCrossed, Tag, ChevronDown, ChevronUp, Clock, MapPin, Phone, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { useUserStores, UserStore, StoreMenuItem, StoreVoucher } from '@/hooks/useUserStores';
import { StoreFormModal } from './StoreFormModal';
import { MenuItemForm } from './MenuItemForm';
import { VoucherForm } from './VoucherForm';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const { stores, isLoading, fetchStores, deleteStore, fetchMenuItems, fetchVouchers, deleteMenuItem, deleteVoucher } = useUserStores();
  
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [editingStore, setEditingStore] = useState<UserStore | null>(null);
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'voucher'>('menu');
  
  // Menu & voucher state for expanded store
  const [menuItems, setMenuItems] = useState<StoreMenuItem[]>([]);
  const [vouchers, setVouchers] = useState<StoreVoucher[]>([]);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showVoucherForm, setShowVoucherForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<StoreMenuItem | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<StoreVoucher | null>(null);

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

  const handleDeleteStore = async (storeId: string) => {
    if (confirm(language === 'vi' ? 'Bạn có chắc muốn xóa cửa hàng này?' : 'Are you sure you want to delete this store?')) {
      await deleteStore(storeId);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (confirm(language === 'vi' ? 'Xóa món này?' : 'Delete this item?')) {
      await deleteMenuItem(itemId);
      if (expandedStoreId) {
        const items = await fetchMenuItems(expandedStoreId);
        setMenuItems(items);
      }
    }
  };

  const handleDeleteVoucher = async (voucherId: string) => {
    if (confirm(language === 'vi' ? 'Xóa voucher này?' : 'Delete this voucher?')) {
      await deleteVoucher(voucherId);
      if (expandedStoreId) {
        const voucherList = await fetchVouchers(expandedStoreId);
        setVouchers(voucherList);
      }
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
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background z-50 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            {language === 'vi' ? 'Cửa hàng của tôi' : 'My Stores'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!user ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground mb-4">
                {language === 'vi' ? 'Đăng nhập để quản lý cửa hàng' : 'Login to manage your stores'}
              </p>
              <Button onClick={onLoginClick}>
                {language === 'vi' ? 'Đăng nhập' : 'Login'}
              </Button>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
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
              {stores.map(store => (
                <div key={store.id} className="border rounded-xl overflow-hidden">
                  {/* Store header */}
                  <div className="p-4">
                    <div className="flex gap-3">
                      {store.image_url ? (
                        <img src={store.image_url} alt={store.name_vi} className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                          <Store className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold truncate">
                            {language === 'en' && store.name_en ? store.name_en : store.name_vi}
                          </h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[store.status as keyof typeof STATUS_COLORS]}`}>
                            {STATUS_LABELS[store.status as keyof typeof STATUS_LABELS]?.[language] || store.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{language === 'en' && store.address_en ? store.address_en : store.address_vi}</span>
                        </div>
                        {store.phone && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span>{store.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingStore(store);
                          setShowStoreForm(true);
                        }}
                        className="flex-1"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        {language === 'vi' ? 'Sửa' : 'Edit'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteStore(store.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedStoreId(expandedStoreId === store.id ? null : store.id)}
                      >
                        {expandedStoreId === store.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>

                    {store.status === 'pending' && (
                      <div className="flex items-center gap-2 mt-3 text-xs text-yellow-600 bg-yellow-500/10 p-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        {language === 'vi' ? 'Cửa hàng đang chờ admin duyệt' : 'Store is pending admin approval'}
                      </div>
                    )}
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {expandedStoreId === store.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t bg-muted/30"
                      >
                        {/* Tabs */}
                        <div className="flex border-b">
                          <button
                            onClick={() => setActiveTab('menu')}
                            className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1 ${
                              activeTab === 'menu' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
                            }`}
                          >
                            <UtensilsCrossed className="w-4 h-4" />
                            Menu ({menuItems.length})
                          </button>
                          <button
                            onClick={() => setActiveTab('voucher')}
                            className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1 ${
                              activeTab === 'voucher' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'
                            }`}
                          >
                            <Tag className="w-4 h-4" />
                            Voucher ({vouchers.length})
                          </button>
                        </div>

                        <div className="p-4">
                          {activeTab === 'menu' ? (
                            <>
                              {/* Add menu item form */}
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

                              {!showMenuForm && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowMenuForm(true)}
                                  className="w-full mb-3"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  {language === 'vi' ? 'Thêm món' : 'Add Item'}
                                </Button>
                              )}

                              {/* Menu items list */}
                              <div className="space-y-2">
                                {menuItems.map(item => (
                                  <div key={item.id} className="flex items-center gap-3 p-2 bg-background rounded-lg">
                                    {item.image_url ? (
                                      <img src={item.image_url} alt={item.name_vi} className="w-12 h-12 rounded-lg object-cover" />
                                    ) : (
                                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                        <UtensilsCrossed className="w-5 h-5 text-muted-foreground" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">
                                        {language === 'en' && item.name_en ? item.name_en : item.name_vi}
                                      </p>
                                      <p className="text-xs text-primary font-semibold">{formatPrice(item.price)}</p>
                                    </div>
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => {
                                          setEditingMenuItem(item);
                                          setShowMenuForm(true);
                                        }}
                                        className="p-1.5 hover:bg-muted rounded"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMenuItem(item.id)}
                                        className="p-1.5 hover:bg-muted rounded text-red-500"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Add voucher form */}
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

                              {!showVoucherForm && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowVoucherForm(true)}
                                  className="w-full mb-3"
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  {language === 'vi' ? 'Tạo voucher' : 'Create Voucher'}
                                </Button>
                              )}

                              {/* Vouchers list */}
                              <div className="space-y-2">
                                {vouchers.map(voucher => (
                                  <div key={voucher.id} className="p-3 bg-background rounded-lg">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                            {voucher.code}
                                          </span>
                                          {!voucher.is_active && (
                                            <span className="text-xs text-muted-foreground">
                                              ({language === 'vi' ? 'Tạm dừng' : 'Inactive'})
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-sm font-medium mt-1">
                                          {language === 'en' && voucher.title_en ? voucher.title_en : voucher.title_vi}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {voucher.discount_type === 'percent' 
                                            ? `${voucher.discount_value}%` 
                                            : formatPrice(voucher.discount_value)
                                          }
                                          {voucher.min_order ? ` • Min ${formatPrice(voucher.min_order)}` : ''}
                                        </p>
                                      </div>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => {
                                            setEditingVoucher(voucher);
                                            setShowVoucherForm(true);
                                          }}
                                          className="p-1.5 hover:bg-muted rounded"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteVoucher(voucher.id)}
                                          className="p-1.5 hover:bg-muted rounded text-red-500"
                                        >
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
              ))}

              {/* Add new store button */}
              <Button onClick={() => setShowStoreForm(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {language === 'vi' ? 'Thêm cửa hàng mới' : 'Add New Store'}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Store form modal */}
      <StoreFormModal
        isOpen={showStoreForm}
        onClose={() => {
          setShowStoreForm(false);
          setEditingStore(null);
        }}
        store={editingStore}
        onSuccess={() => fetchStores()}
      />
    </>
  );
};
