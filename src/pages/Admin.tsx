import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStores, AdminStore } from '@/hooks/useAdminStores';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LogOut, ArrowLeft, Check, X, MapPin, Eye, Store, ShieldAlert, 
  Briefcase, Users, Trash2, Megaphone, Crown, Calendar 
} from 'lucide-react';
import { StoreDetailModal } from '@/components/admin/StoreDetailModal'; 
import { AdminStoreClaims } from '@/components/admin/AdminStoreClaims'; 
import { toast } from 'sonner';

// 👇 Lấy link Backend
const API_URL = import.meta.env.VITE_API_URL;

// --- 1. COMPONENT QUẢN LÝ QUẢNG CÁO ---
const AdsManagement = () => {
  const [ads, setAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/ads`);
      const data = await res.json();
      if (Array.isArray(data)) setAds(data);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải quảng cáo");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const handleCancelAd = async (id: string) => {
    if (!confirm("Hủy quảng cáo này?")) return;
    try {
      await fetch(`${API_URL}/api/admin/ads/cancel/${id}`, { method: 'PUT' });
      toast.success("Đã hủy quảng cáo");
      setAds(prev => prev.filter(ad => ad.id !== id));
    } catch {
      toast.error("Lỗi khi hủy");
    }
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center p-8"><div className="animate-spin w-6 h-6 border-2 border-blue-600 rounded-full border-t-transparent"></div></div>
      ) : ads.length === 0 ? (
        <div className="text-gray-500 text-center py-12 bg-gray-50 rounded-xl border border-dashed">
            Hiện không có cửa hàng nào chạy quảng cáo.
        </div> 
      ) : null}
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ads.map(ad => {
           const expiry = new Date(ad.ad_expiry);
           const now = new Date();
           const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
           const isExpired = diffDays < 0;

           return (
            <div key={ad.id} className="bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
               <div className="h-32 bg-gray-100 relative group">
                  <img src={ad.image_url} className="w-full h-full object-cover" onError={e => e.currentTarget.src='https://placehold.co/400x200'} />
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md flex items-center gap-1">
                     <Megaphone size={12}/> Đang chạy
                  </div>
               </div>
               <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1">{ad.name_vi}</h4>
                  <p className="text-xs text-gray-500 mb-4 truncate flex items-center gap-1">
                    <Users size={12}/> {ad.user_email}
                  </p>
                  
                  <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded text-blue-800 border border-blue-100">
                       <span className="flex items-center gap-1 text-xs"><Calendar className="w-3 h-3"/> Hết hạn:</span>
                       <span className="font-bold">{expiry.toLocaleDateString('vi-VN')}</span>
                    </div>
                    
                    <div className={`text-center text-xs font-bold ${isExpired ? 'text-red-500' : 'text-green-600'}`}>
                       {isExpired ? 'Đã hết hạn' : `Còn lại ${diffDays} ngày`}
                    </div>

                    <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 h-8 text-xs" onClick={() => handleCancelAd(ad.id)}>
                       <X className="w-3 h-3 mr-2"/> Dừng Quảng Cáo
                    </Button>
                  </div>
               </div>
            </div>
           )
        })}
      </div>
    </div>
  );
};

// --- 2. COMPONENT QUẢN LÝ VIỆC LÀM ---
const JobsManagement = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/jobs`);
      const data = await res.json();
      if (Array.isArray(data)) setJobs(data);
    } catch {
      toast.error("Lỗi tải tin tuyển dụng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleDeleteJob = async (id: number) => {
    if(!confirm("Xóa tin này?")) return;
    try {
      await fetch(`${API_URL}/api/admin/jobs/${id}`, { method: 'DELETE' });
      setJobs(prev => prev.filter(j => j.id !== id));
      toast.success("Đã xóa");
    } catch {
      toast.error("Lỗi xóa");
    }
  };

  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      await fetch(`${API_URL}/api/admin/jobs/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
      toast.success(`Đã cập nhật: ${status}`);
    } catch {
      toast.error("Lỗi cập nhật");
    }
  };

  return (
    <div className="space-y-4">
        {jobs.length === 0 && <p className="text-gray-500 text-center py-8">Chưa có tin tuyển dụng nào.</p>}
        {jobs.map(job => (
            <div key={job.id} className="bg-white p-4 rounded-lg border flex flex-col md:flex-row justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-800 text-lg">{job.title}</h4>
                        <Badge className={job.status === 'approved' ? 'bg-green-100 text-green-700' : job.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                            {job.status === 'approved' ? 'Đã duyệt' : job.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                        </Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{job.shop_name} <span className="text-gray-400">|</span> {job.salary}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{job.description}</p>
                    <p className="text-[10px] text-gray-400 mt-2">Ngày đăng: {new Date(job.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
                
                <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4">
                    {job.status === 'pending' && (
                        <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateStatus(job.id, 'approved')}>
                                <Check className="w-4 h-4 mr-1"/> Duyệt
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(job.id, 'rejected')}>
                                <X className="w-4 h-4 mr-1"/> Bỏ
                            </Button>
                        </>
                    )}
                    <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteJob(job.id)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        ))}
    </div>
  );
};

// --- 3. COMPONENT QUẢN LÝ USER ---
const UsersManagement = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/api/admin/users`);
                const data = await res.json();
                if (Array.isArray(data)) setUsers(data);
            } catch {
                console.error("Lỗi tải users");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleDeleteUser = async (id: string) => {
        if(!confirm("Cảnh báo: Xóa user sẽ mất hết dữ liệu liên quan!")) return;
        try {
            await fetch(`${API_URL}/api/admin/users/${id}`, { method: 'DELETE' });
            setUsers(prev => prev.filter(u => u.id !== id));
            toast.success("Đã xóa hồ sơ");
        } catch {
            toast.error("Lỗi xóa user");
        }
    };

    if(loading) return <div className="p-8 text-center text-gray-500">Đang tải danh sách người dùng...</div>;

    return (
        <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-gray-600 font-bold">User / Email</th>
                            <th className="p-4 text-gray-600 font-bold">Trạng thái</th>
                            <th className="p-4 text-gray-600 font-bold">Ngày tham gia</th>
                            <th className="p-4 text-right text-gray-600 font-bold">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                        {user.email}
                                        {user.isVip && (
                                            <span className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0.5 rounded border border-yellow-200 flex items-center gap-1 shadow-sm">
                                                <Crown className="w-3 h-3 fill-yellow-600" /> VIP
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">{user.username || 'Chưa đặt tên'}</div>
                                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{user.id}</div>
                                </td>
                                <td className="p-4">
                                    <Badge variant="outline" className={user.isVip ? "border-yellow-500 text-yellow-700 bg-yellow-50" : "text-gray-500"}>
                                        {user.isVip ? 'Premium User' : 'Thành viên'}
                                    </Badge>
                                </td>
                                <td className="p-4 text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-4 text-right">
                                    <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDeleteUser(user.id)}>
                                        <Trash2 className="w-4 h-4"/>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- TRANG ADMIN CHÍNH ---
const Admin = () => {
  const { stores, isLoading, isAdmin, setFilter, updateStoreStatus, deleteStore } = useAdminStores();
  const { signOut } = useAuth();
  const navigate = useNavigate();
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

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="w-5 h-5" /></Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm">Hệ thống quản lý ThodiaUni</p>
            </div>
          </div>
          <Button variant="destructive" onClick={() => signOut()} className="shadow-red-200 shadow-lg"><LogOut className="w-4 h-4 mr-2" />Đăng xuất</Button>
        </div>

        {/* --- MAIN TABS --- */}
        <Tabs defaultValue="stores" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 h-12 bg-white border shadow-sm rounded-lg p-1">
            <TabsTrigger value="stores" className="text-sm font-medium data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <Store className="w-4 h-4 mr-2" /> Cửa hàng
            </TabsTrigger>
            
            <TabsTrigger value="ads" className="text-sm font-medium data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700">
              <Megaphone className="w-4 h-4 mr-2" /> Quảng cáo
            </TabsTrigger>

            <TabsTrigger value="jobs" className="text-sm font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Briefcase className="w-4 h-4 mr-2" /> Tuyển dụng
            </TabsTrigger>
            <TabsTrigger value="users" className="text-sm font-medium data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              <Users className="w-4 h-4 mr-2" /> Người dùng
            </TabsTrigger>
            <TabsTrigger value="claims" className="text-sm font-medium data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700">
              <ShieldAlert className="w-4 h-4 mr-2" /> Xác minh
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: DANH SÁCH CỬA HÀNG */}
          <TabsContent value="stores">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Danh sách cửa hàng</CardTitle>
                <CardDescription>Hiện có {stores.length} cửa hàng trong hệ thống.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pending" className="w-full" onValueChange={(val) => setFilter(val as any)}>
                  <TabsList className="mb-6 bg-gray-100 w-full justify-start overflow-x-auto">
                    <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
                    <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
                    <TabsTrigger value="rejected">Từ chối</TabsTrigger>
                    <TabsTrigger value="all">Tất cả</TabsTrigger>
                  </TabsList>
                  
                  <div className="grid gap-4">
                    {stores.length === 0 ? <p className="text-center py-12 text-muted-foreground">Không có dữ liệu</p> : stores.map((store) => (
                      <div key={store.id} className="flex flex-col md:flex-row gap-4 bg-white border rounded-xl p-4 hover:shadow-md transition-all">
                        <div className="w-full md:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                          <img 
                            src={store.image_url || "https://placehold.co/400x400?text=Store"} 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = "https://placehold.co/400x400?text=No+Image"; }}
                          />
                          {store.is_premium && <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 rounded flex items-center gap-1 shadow-sm"><Crown className="w-3 h-3 fill-current"/> VIP</span>}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-gray-800">{store.name_vi}</h3>
                            <Badge className={store.status === 'approved' ? 'bg-green-100 text-green-700' : store.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
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
          
          {/* TAB 2: QUẢN LÝ QUẢNG CÁO */}
          <TabsContent value="ads">
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle>Quảng cáo đang chạy</CardTitle>
                    <CardDescription>Quản lý các chiến dịch quảng cáo của cửa hàng.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AdsManagement />
                </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: QUẢN LÝ TIN TUYỂN DỤNG */}
          <TabsContent value="jobs">
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle>Tin tuyển dụng</CardTitle>
                    <CardDescription>Duyệt và quản lý các bài đăng tìm việc làm.</CardDescription>
                </CardHeader>
                <CardContent>
                    <JobsManagement />
                </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: QUẢN LÝ NGƯỜI DÙNG */}
          <TabsContent value="users">
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle>Danh sách người dùng</CardTitle>
                    <CardDescription>Quản lý tài khoản trong hệ thống.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UsersManagement />
                </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: YÊU CẦU XÁC MINH */}
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