import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStores, AdminStore } from '@/hooks/useAdminStores';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, ArrowLeft, Check, X, MapPin, Eye, Store, ShieldAlert, Briefcase, Users, Trash2, Edit } from 'lucide-react';
import { StoreDetailModal } from '@/components/admin/StoreDetailModal'; 
import { AdminStoreClaims } from '@/components/admin/AdminStoreClaims'; 
import { toast } from 'sonner';

// --- 1. COMPONENT QUẢN LÝ VIỆC LÀM (JOBS) ---
const JobsManagement = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lấy dữ liệu từ bảng 'jobs'
  const fetchJobs = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        toast.error("Lỗi tải tin tuyển dụng");
    } else {
        setJobs(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleDeleteJob = async (id: number) => {
    if(!confirm("Bạn có chắc muốn xóa tin này vĩnh viễn?")) return;
    
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if(!error) {
        toast.success("Đã xóa tin tuyển dụng");
        setJobs(prev => prev.filter(j => j.id !== id));
    } else {
        toast.error("Lỗi xóa: " + error.message);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
    const { error } = await supabase.from('jobs').update({ status }).eq('id', id);
    if(!error) {
        toast.success(`Đã cập nhật: ${status}`);
        setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
    } else {
        toast.error("Lỗi cập nhật");
    }
  };

  return (
    <div className="space-y-4">
        {isLoading ? <p>Đang tải...</p> : jobs.length === 0 ? <p className="text-gray-500 text-center py-8">Chưa có tin tuyển dụng nào.</p> : null}
        
        {jobs.map(job => (
            <div key={job.id} className="bg-white p-4 rounded-lg border flex flex-col md:flex-row justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg text-gray-800">{job.title}</h4>
                        <Badge className={job.status === 'approved' ? 'bg-green-100 text-green-700' : job.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                            {job.status === 'approved' ? 'Đã duyệt' : job.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                        </Badge>
                    </div>
                    <p className="text-sm font-semibold text-gray-700"><Store className="w-3 h-3 inline mr-1"/> {job.shop_name} <span className="text-gray-400 font-normal mx-1">|</span> {job.salary}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                    <p className="text-[10px] text-gray-400 mt-2">Ngày đăng: {new Date(job.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
                
                <div className="flex items-center gap-2 border-t pt-3 md:border-t-0 md:pt-0 md:border-l md:pl-4">
                    {job.status === 'pending' && (
                        <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8" onClick={() => handleUpdateStatus(job.id, 'approved')}>
                                <Check className="w-4 h-4 mr-1"/> Duyệt
                            </Button>
                            <Button size="sm" variant="secondary" className="h-8" onClick={() => handleUpdateStatus(job.id, 'rejected')}>
                                <X className="w-4 h-4 mr-1"/> Bỏ
                            </Button>
                        </>
                    )}
                    
                    {/* Nút xóa luôn hiện để Admin dọn dẹp */}
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDeleteJob(job.id)} title="Xóa tin">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        ))}
    </div>
  );
};

// --- 2. COMPONENT QUẢN LÝ USER (Dựa trên bảng profiles) ---
const UsersManagement = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            // Kết nối đúng bảng 'profiles' như trong ảnh bạn gửi
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) toast.error("Lỗi tải người dùng");
            else setUsers(data || []);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const handleDeleteUser = async (id: string) => {
        if(!confirm("CẢNH BÁO QUAN TRỌNG:\nXóa người dùng khỏi bảng Profiles sẽ không xóa tài khoản đăng nhập của họ, nhưng sẽ làm mất dữ liệu hiển thị.\n\nBạn có chắc chắn muốn tiếp tục?")) return;
        
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        
        if(!error) {
            toast.success("Đã xóa hồ sơ người dùng");
            setUsers(prev => prev.filter(u => u.id !== id));
        } else {
            toast.error("Lỗi xóa: " + error.message);
        }
    };

    if (loading) return <div>Đang tải danh sách thành viên...</div>;

    return (
        <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-bold text-gray-600">Email (Tài khoản)</th>
                            <th className="p-4 font-bold text-gray-600">Ngày tham gia</th>
                            <th className="p-4 font-bold text-gray-600">ID Hệ thống</th>
                            <th className="p-4 font-bold text-right text-gray-600">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-gray-900">{user.email}</div>
                                    <div className="text-xs text-gray-500">{user.username || 'Chưa đặt tên'}</div>
                                </td>
                                <td className="p-4 text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-4 text-xs font-mono text-gray-400 select-all">
                                    {user.id}
                                </td>
                                <td className="p-4 text-right">
                                    <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="text-red-600 hover:bg-red-50 hover:text-red-700" 
                                        onClick={() => handleDeleteUser(user.id)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-1"/> Xóa hồ sơ
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
  const { stores, isLoading, isAdmin, filter, setFilter, updateStoreStatus, deleteStore } = useAdminStores();
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

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
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
          <TabsList className="grid w-full grid-cols-4 mb-8 h-12 bg-white border shadow-sm rounded-lg p-1">
            <TabsTrigger value="stores" className="text-sm font-medium data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
              <Store className="w-4 h-4 mr-2" /> Cửa hàng
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
                            alt={store.name_vi} 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = "https://placehold.co/400x400?text=No+Image"; }}
                          />
                          {store.is_premium && <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 rounded">VIP</span>}
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
          
          {/* TAB 2: QUẢN LÝ TIN TUYỂN DỤNG */}
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

          {/* TAB 3: QUẢN LÝ NGƯỜI DÙNG */}
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

          {/* TAB 4: YÊU CẦU XÁC MINH */}
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