import { useEffect, useState } from 'react'; // <-- Thêm useState
import { useNavigate } from 'react-router-dom';
import { useAdminStores, AdminStore } from '@/hooks/useAdminStores';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, ArrowLeft, Check, X, Store, MapPin, Phone, Eye } from 'lucide-react'; // <-- Thêm icon Eye
import { StoreDetailModal } from '@/components/admin/StoreDetailModal'; // <-- Import Modal mới

const Admin = () => {
  const { stores, isLoading, isAdmin, filter, setFilter, updateStoreStatus, deleteStore } = useAdminStores();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // --- STATE CHO MODAL ---
  const [selectedStore, setSelectedStore] = useState<AdminStore | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  // ----------------------

  useEffect(() => {
    if (!isLoading && !isAdmin) navigate('/');
  }, [isAdmin, isLoading, navigate]);

  const handleApprove = async (id: string) => await updateStoreStatus(id, 'approved');
  const handleReject = async (id: string) => await updateStoreStatus(id, 'rejected');

  // Hàm mở modal
  const handleViewDetails = (store: AdminStore) => {
    setSelectedStore(store);
    setShowDetailModal(true);
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="w-5 h-5" /></Button>
            <div><h1 className="text-2xl font-bold">Quản Trị Hệ Thống</h1><p className="text-muted-foreground">Quản lý cửa hàng</p></div>
          </div>
          <Button variant="destructive" onClick={() => signOut()}><LogOut className="w-4 h-4 mr-2" />Đăng xuất</Button>
        </div>

        <Card className="border-none shadow-md">
          <CardHeader><CardTitle>Danh sách cửa hàng</CardTitle><CardDescription>Hiện có {stores.length} cửa hàng.</CardDescription></CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full" onValueChange={(val) => setFilter(val as any)}>
              <TabsList className="mb-6"><TabsTrigger value="pending">Chờ duyệt</TabsTrigger><TabsTrigger value="approved">Đã duyệt</TabsTrigger><TabsTrigger value="rejected">Từ chối</TabsTrigger><TabsTrigger value="all">Tất cả</TabsTrigger></TabsList>
              
              <div className="grid gap-4">
                {stores.length === 0 ? <p className="text-center py-12 text-muted-foreground">Trống</p> : stores.map((store) => (
                  <div key={store.id} className="flex flex-col md:flex-row gap-4 bg-white border rounded-xl p-4 hover:shadow-md transition-all">
                   <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
  {store.image_url ? (
    <img 
      src={store.image_url} 
      alt={store.name_vi} // Thêm alt cho chuẩn SEO
      className="w-full h-full object-cover"
      onError={(e) => {
        // QUAN TRỌNG: Nếu ảnh bị lỗi (như lỗi via.placeholder), nó tự đổi sang ảnh này
        e.currentTarget.src = "https://placehold.co/400x400?text=No+Image";
      }}
    />
  ) : (
    // Nếu chưa có ảnh thì hiện ảnh mẫu luôn
    <img 
      src="https://placehold.co/400x400?text=Store" 
      alt="Placeholder"
      className="w-full h-full object-cover opacity-50"
    />
  )}
</div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-lg">{store.name_vi}</h3>
                        <Badge className={store.status === 'approved' ? 'bg-green-100 text-green-700' : store.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>{store.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 flex gap-2"><MapPin className="w-4 h-4"/> {store.address_vi}</p>
                      <p className="text-xs text-gray-400">Email: {store.user_email}</p>
                    </div>
                    
                    <div className="flex flex-col gap-2 justify-center border-l pl-4">
                      {/* --- NÚT XEM CHI TIẾT --- */}
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(store)}>
                        <Eye className="w-4 h-4 mr-1"/> Xem chi tiết
                      </Button>
                      {/* ---------------------- */}
                      
                      {store.status === 'pending' && (
                        <>
                          <Button size="sm" className="bg-green-600 text-white" onClick={() => handleApprove(store.id)}><Check className="w-4 h-4 mr-1"/> Duyệt</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleReject(store.id)}><X className="w-4 h-4 mr-1"/> Từ chối</Button>
                        </>
                      )}
                      {store.status !== 'pending' && <Button size="sm" variant="outline" onClick={() => deleteStore(store.id)} className="text-red-600 hover:bg-red-50"><LogOut className="w-4 h-4 mr-1"/> Xóa</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* --- COMPONENT MODAL CHI TIẾT --- */}
        <StoreDetailModal 
          isOpen={showDetailModal} 
          onClose={() => setShowDetailModal(false)} 
          store={selectedStore} 
        />
        {/* -------------------------------- */}
      </div>
    </div>
  );
};

export default Admin;