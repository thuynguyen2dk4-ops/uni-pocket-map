import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStores, AdminStore } from '@/hooks/useAdminStores';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Trash2, 
  Eye, 
  Store, 
  Clock,
  MapPin,
  Phone,
  User,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

const Admin = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { 
    stores, 
    isLoading, 
    isAdmin, 
    filter, 
    setFilter, 
    updateStoreStatus, 
    deleteStore 
  } = useAdminStores();
  const [selectedStore, setSelectedStore] = useState<AdminStore | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const texts = {
    vi: {
      title: 'Quản lý cửa hàng',
      back: 'Quay lại',
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
      all: 'Tất cả',
      noStores: 'Không có cửa hàng nào',
      approve: 'Duyệt',
      reject: 'Từ chối',
      delete: 'Xóa',
      view: 'Xem',
      name: 'Tên cửa hàng',
      category: 'Danh mục',
      status: 'Trạng thái',
      createdAt: 'Ngày tạo',
      actions: 'Thao tác',
      owner: 'Chủ sở hữu',
      address: 'Địa chỉ',
      phone: 'Điện thoại',
      hours: 'Giờ mở cửa',
      description: 'Mô tả',
      notAdmin: 'Bạn không có quyền truy cập trang này',
      loading: 'Đang tải...',
      storeDetail: 'Chi tiết cửa hàng',
    },
    en: {
      title: 'Store Management',
      back: 'Back',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      all: 'All',
      noStores: 'No stores found',
      approve: 'Approve',
      reject: 'Reject',
      delete: 'Delete',
      view: 'View',
      name: 'Store Name',
      category: 'Category',
      status: 'Status',
      createdAt: 'Created At',
      actions: 'Actions',
      owner: 'Owner',
      address: 'Address',
      phone: 'Phone',
      hours: 'Open Hours',
      description: 'Description',
      notAdmin: 'You do not have permission to access this page',
      loading: 'Loading...',
      storeDetail: 'Store Details',
    }
  };

  const t = texts[language];

  const categoryLabels: Record<string, { vi: string; en: string }> = {
    food: { vi: 'Đồ ăn', en: 'Food' },
    cafe: { vi: 'Cà phê', en: 'Cafe' },
    service: { vi: 'Dịch vụ', en: 'Service' },
    shop: { vi: 'Cửa hàng', en: 'Shop' },
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
    approved: 'bg-green-500/20 text-green-600 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-600 border-red-500/30',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <ShieldAlert className="w-16 h-16 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t.notAdmin}</h2>
            <Button onClick={() => navigate('/')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.back}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingCount = stores.filter(s => s.status === 'pending').length;
  const approvedCount = stores.filter(s => s.status === 'approved').length;
  const rejectedCount = stores.filter(s => s.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">{t.title}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setFilter('pending')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t.pending}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setFilter('approved')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t.approved}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setFilter('rejected')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t.rejected}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setFilter('all')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t.all}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stores.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="pending">{t.pending}</TabsTrigger>
            <TabsTrigger value="approved">{t.approved}</TabsTrigger>
            <TabsTrigger value="rejected">{t.rejected}</TabsTrigger>
            <TabsTrigger value="all">{t.all}</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-0">
            {stores.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t.noStores}</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t.name}</TableHead>
                        <TableHead className="hidden md:table-cell">{t.category}</TableHead>
                        <TableHead className="hidden md:table-cell">{t.owner}</TableHead>
                        <TableHead>{t.status}</TableHead>
                        <TableHead className="hidden md:table-cell">{t.createdAt}</TableHead>
                        <TableHead className="text-right">{t.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stores.map((store) => (
                        <TableRow key={store.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {store.image_url && (
                                <img 
                                  src={store.image_url} 
                                  alt={store.name_vi}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <div>{language === 'vi' ? store.name_vi : (store.name_en || store.name_vi)}</div>
                                <div className="text-xs text-muted-foreground md:hidden">
                                  {categoryLabels[store.category]?.[language] || store.category}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {categoryLabels[store.category]?.[language] || store.category}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {store.user_email}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[store.status]}>
                              {store.status === 'pending' && t.pending}
                              {store.status === 'approved' && t.approved}
                              {store.status === 'rejected' && t.rejected}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {formatDate(store.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedStore(store);
                                  setShowDetail(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {store.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-100"
                                    onClick={() => updateStoreStatus(store.id, 'approved')}
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                    onClick={() => updateStoreStatus(store.id, 'rejected')}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  if (confirm(language === 'vi' ? 'Bạn có chắc muốn xóa cửa hàng này?' : 'Are you sure you want to delete this store?')) {
                                    deleteStore(store.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Store Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              {t.storeDetail}
            </DialogTitle>
          </DialogHeader>
          
          {selectedStore && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {selectedStore.image_url && (
                <img 
                  src={selectedStore.image_url} 
                  alt={selectedStore.name_vi}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {language === 'vi' ? selectedStore.name_vi : (selectedStore.name_en || selectedStore.name_vi)}
                  </h3>
                  <Badge variant="outline" className={statusColors[selectedStore.status]}>
                    {selectedStore.status === 'pending' && t.pending}
                    {selectedStore.status === 'approved' && t.approved}
                    {selectedStore.status === 'rejected' && t.rejected}
                  </Badge>
                </div>

                <div className="grid gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">{t.owner}: </span>
                      {selectedStore.user_email}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">{t.address}: </span>
                      {language === 'vi' ? selectedStore.address_vi : (selectedStore.address_en || selectedStore.address_vi)}
                    </div>
                  </div>
                  
                  {selectedStore.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">{t.phone}: </span>
                        {selectedStore.phone}
                      </div>
                    </div>
                  )}
                  
                  {(selectedStore.open_hours_vi || selectedStore.open_hours_en) && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground">{t.hours}: </span>
                        {language === 'vi' ? selectedStore.open_hours_vi : (selectedStore.open_hours_en || selectedStore.open_hours_vi)}
                      </div>
                    </div>
                  )}
                  
                  {(selectedStore.description_vi || selectedStore.description_en) && (
                    <div>
                      <span className="text-muted-foreground">{t.description}: </span>
                      <p className="mt-1">
                        {language === 'vi' ? selectedStore.description_vi : (selectedStore.description_en || selectedStore.description_vi)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  <span>{t.createdAt}: </span>
                  {formatDate(selectedStore.created_at)}
                </div>

                {/* Action buttons */}
                {selectedStore.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        updateStoreStatus(selectedStore.id, 'approved');
                        setShowDetail(false);
                      }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {t.approve}
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        updateStoreStatus(selectedStore.id, 'rejected');
                        setShowDetail(false);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t.reject}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
