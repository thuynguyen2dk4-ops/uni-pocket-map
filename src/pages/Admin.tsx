import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStores, AdminStore } from '@/hooks/useAdminStores';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, ArrowLeft, Check, X, MapPin, Eye, Store, ShieldAlert } from 'lucide-react';
import { StoreDetailModal } from '@/components/admin/StoreDetailModal'; 
import { AdminStoreClaims } from '@/components/admin/AdminStoreClaims'; // <-- Import component quản lý yêu cầu

const Admin = () => {
  const { stores, isLoading, isAdmin, filter, setFilter, updateStoreStatus, deleteStore } = useAdminStores();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // --- STATE CHO MODAL CHI TIẾT ---
  const [selectedStore, setSelectedStore] = useState<AdminStore | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) navigate('/');
  }, [isAdmin, isLoading, navigate]);

  const handleApprove = async (id: string) => await updateStoreStatus(id, 'approved');
  const handleReject = async (id: string) => await updateStoreStatus(id, 'rejected');

  const handleViewDetails = (store: AdminStore) => {
    setSelectedStore(store);
    setShowDetailModal(true);
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="w-5 h-5" /></Button>
            <div>
              <h1 className="text-2xl font-bold">Quản Trị Hệ Thống</h1>
              <p className="text-muted-foreground">Xin chào Admin</p>
            </div>
          </div>
          <Button variant="destructive" onClick={() => signOut()}><LogOut className="w-4 h-4 mr-2" />Đăng xuất</Button>
        </div>

        {/* --- TAB CHÍNH CỦA TRANG ADMIN --- */}
        <Tabs defaultValue="stores" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
            <TabsTrigger value="stores" className="text-base flex items-center gap-2">
              <Store className="w-4 h-4" /> Quản lý Cửa hàng
            </TabsTrigger>
            <TabsTrigger value="claims" className="text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Yêu cầu xác minh
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: DANH SÁCH CỬA HÀNG (Logic cũ của bạn) */}
          <TabsContent value="stores">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Danh sách cửa hàng</CardTitle>
                <CardDescription>Hiện có {stores.length} cửa hàng trong hệ thống.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Tabs con để lọc trạng thái */}
                <Tabs defaultValue="pending" className="w-full" onValueChange={(val) => setFilter(val as any)}>
                  <TabsList className="mb-6 bg-gray-100">
                    <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
                    <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
                    <TabsTrigger value="rejected">Từ chối</TabsTrigger>
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                  </TabsList>
                  
                  <div className="grid gap-4">
                    {stores.length === 0 ? <p className="text-center py-12 text-muted-foreground">Không có dữ liệu</p> : stores.map((store) => (
                      <div key={store.id} className="flex flex-col md:flex-row gap-4 bg-white border rounded-xl p-4 hover:shadow-md transition-all">
                        <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={store.image_url || "https://placehold.co/400x400?text=Store"} 
                            alt={store.name_vi} 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = "https://placehold.co/400x400?text=No+Image"; }}
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-gray-800">{store.name_vi}</h3>
                            <Badge className={store.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' : store.status === 'rejected' ? 'bg-red-100 text-red-700 hover:bg-red-100' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'}>
                              {store.status === 'approved' ? 'Hoạt động' : store.status === 'rejected' ? 'Đã khóa' : 'Chờ duyệt'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 flex gap-2"><MapPin className="w-4 h-4 text-gray-400"/> {store.address_vi}</p>
                          <p className="text-xs text-gray-400">Owner: {store.user_email}</p>
                        </div>
                        
                        <div className="flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 min-w-[140px]">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(store)}>
                            <Eye className="w-4 h-4 mr-2"/> Chi tiết
                          </Button>
                          
                          {store.status === 'pending' && (
                            <>
                              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(store.id)}>
                                <Check className="w-4 h-4 mr-2"/> Duyệt
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(store.id)}>
                                <X className="w-4 h-4 mr-2"/> Từ chối
                              </Button>
                            </>
                          )}
                          {store.status !== 'pending' && (
                            <Button size="sm" variant="ghost" onClick={() => deleteStore(store.id)} className="text-red-600 hover:bg-red-50">
                              <LogOut className="w-4 h-4 mr-2"/> Xóa
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: QUẢN LÝ YÊU CẦU XÁC MINH (Component mới) */}
          <TabsContent value="claims">
            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <AdminStoreClaims />
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* MODAL CHI TIẾT */}
        <StoreDetailModal 
          isOpen={showDetailModal} 
          onClose={() => setShowDetailModal(false)} 
          store={selectedStore} 
        />
      </div>
    </div>
  );
};

export default Admin;