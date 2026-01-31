import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Search, MapPin, Clock, Briefcase, 
  PlusCircle, Building2, Phone, FileText, X, CheckCircle2, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/useAuth';

// 👇 Lấy link Backend
const API_URL = import.meta.env.VITE_API_URL;

export const JobsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Lấy thông tin user
  
  const [showPostModal, setShowPostModal] = useState(false);
  const [filter, setFilter] = useState('Tất cả');
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 1. LẤY DANH SÁCH TIN ĐÃ DUYỆT TỪ API ---
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/jobs/approved`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setJobs(data);
        } else {
          toast.error("Lỗi dữ liệu từ server");
        }
      } catch (error) {
        console.error("Lỗi lấy tin:", error);
        toast.error("Không tải được danh sách việc làm.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // --- 2. XỬ LÝ ĐĂNG TIN LÊN API ---
  const handlePostJob = async (e: any) => {
    e.preventDefault();

    if (!user) {
        toast.error("Vui lòng đăng nhập để đăng tin!");
        return;
    }

    setIsSubmitting(true);
    
    const formData = new FormData(e.target);
    
    const newJob = {
      title: formData.get('title'),
      shop_name: formData.get('shopName'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      salary: formData.get('salary'),
      type: formData.get('type'),
      description: formData.get('description'),
      user_id: user.uid,   // Dùng user.uid từ Firebase
    };

    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });

      if (!res.ok) throw new Error("Failed to post job");

      toast.success("Đăng tin thành công! Tin của bạn đang chờ Admin duyệt.");
      setShowPostModal(false);

    } catch (error: any) {
      toast.error("Lỗi đăng tin, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedJobId(expandedJobId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-800">
      
      {/* HEADER */}
      <div className="bg-white sticky top-0 z-40 border-b shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="-ml-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <div>
                <h1 className="font-bold text-lg text-gray-800 leading-none">Việc làm</h1>
                <span className="text-[10px] text-gray-500 font-medium">Cơ hội cho sinh viên</span>
            </div>
            </div>
            
            <Button 
                onClick={() => {
                    if (!user) {
                        toast.error("Bạn cần đăng nhập để đăng tin");
                    } else {
                        setShowPostModal(true);
                    }
                }}
                className="bg-green-600 hover:bg-green-700 text-white gap-1.5 h-9 px-4 text-xs font-bold rounded-full shadow-lg shadow-green-200 active:scale-95 transition-all"
            >
                <PlusCircle className="w-4 h-4" />
                Đăng tin Free
            </Button>
        </div>

        {/* SEARCH BAR */}
        <div className="px-4 pb-3 space-y-3">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                <Input 
                    placeholder="Tìm việc (phục vụ, pha chế...)" 
                    className="pl-9 bg-gray-100 border-transparent h-10 text-sm focus-visible:ring-1 focus-visible:ring-green-500 transition-all" 
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" style={{ scrollbarWidth: 'none' }}>
            {['Tất cả', 'Part-time', 'Full-time', 'Ca tối', 'Gần trường'].map(tag => (
                <button 
                    key={tag} 
                    onClick={() => setFilter(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        filter === tag 
                        ? 'bg-green-600 text-white border-green-600 shadow-sm' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                    }`}
                >
                {tag}
                </button>
            ))}
            </div>
        </div>
      </div>

      {/* --- DANH SÁCH VIỆC LÀM --- */}
      <div className="p-4 space-y-3">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                <span className="text-xs">Đang tải tin tuyển dụng...</span>
            </div>
        ) : jobs.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm bg-white rounded-xl border border-dashed">
                Chưa có tin tuyển dụng nào được duyệt.
                <br/>Hãy là người đầu tiên đăng tin!
            </div>
        ) : (
            jobs.map((job) => (
            <motion.div 
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
                {/* TÓM TẮT */}
                <div className="p-4 cursor-pointer" onClick={() => toggleExpand(job.id)}>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 text-base line-clamp-1">{job.title}</h3>
                        <span className="text-green-700 font-extrabold text-sm bg-green-50 px-2 py-0.5 rounded ml-2 whitespace-nowrap">
                            {job.salary}
                        </span>
                    </div>
                    
                    <div className="flex flex-col gap-1 mb-3">
                        <div className="flex items-center gap-1.5 text-gray-700 text-sm font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-blue-500" />
                            {job.shop_name} 
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {job.address}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                            <Clock className="w-3 h-3 text-orange-500" />
                            {new Date(job.created_at).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                            <Briefcase className="w-3 h-3 text-purple-500" />
                            {job.type}
                        </div>
                    </div>
                </div>

                {/* CHI TIẾT (EXPAND) */}
                <AnimatePresence>
                    {expandedJobId === job.id && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-gray-50 border-t border-gray-100 px-4 pb-4 pt-2"
                        >
                            <div className="mb-4">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                                    <FileText className="w-3 h-3" /> Mô tả công việc
                                </h4>
                                <p className="text-sm text-gray-700 leading-relaxed bg-white p-2 rounded border border-gray-200 whitespace-pre-line">
                                    {job.description}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <a 
                                    href={`tel:${job.phone}`}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                                >
                                    <Phone className="w-4 h-4" />
                                    Gọi điện ({job.phone})
                                </a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {expandedJobId !== job.id && (
                    <div 
                        onClick={() => toggleExpand(job.id)}
                        className="bg-gray-50 py-1.5 text-center text-[10px] text-gray-500 font-medium border-t border-gray-100 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                        ▼ Xem chi tiết & Liên hệ
                    </div>
                )}
            </motion.div>
            ))
        )}

        <div className="h-10 text-center text-xs text-gray-400">
            Hết danh sách
        </div>
      </div>

      {/* --- MODAL ĐĂNG TIN --- */}
      {showPostModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowPostModal(false)}
          />
          
          <motion.div 
            initial={{scale: 0.95, opacity: 0, y: 20}} 
            animate={{scale: 1, opacity: 1, y: 0}} 
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative z-10 flex flex-col max-h-[85vh]"
          >
            <div className="bg-green-600 p-4 rounded-t-2xl text-white flex justify-between items-center sticky top-0 z-20">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Đăng tin tuyển dụng
                    </h2>
                    <p className="text-xs text-green-100 opacity-90">Tiếp cận hàng nghìn sinh viên quanh đây</p>
                </div>
                <button 
                    onClick={() => setShowPostModal(false)}
                    className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                >
                    <X className="w-5 h-5 text-white" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <form id="post-job-form" onSubmit={handlePostJob} className="space-y-6">
                    
                    {/* THÔNG TIN QUÁN */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2 border-b pb-1">
                            <Building2 className="w-4 h-4 text-green-600" /> 
                            Thông tin cửa hàng
                        </h3>
                        
                        <div>
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Tên cửa hàng/quán <span className="text-red-500">*</span></label>
                            <Input name="shopName" placeholder="VD: Trà sữa Gong Cha" required className="bg-gray-50" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                                <Input name="phone" placeholder="09xxxx..." required className="bg-gray-50" type="tel" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
                                <Input name="address" placeholder="Số nhà, đường..." required className="bg-gray-50" />
                            </div>
                        </div>
                    </div>

                    {/* CHI TIẾT CÔNG VIỆC */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-800 uppercase flex items-center gap-2 border-b pb-1">
                            <Briefcase className="w-4 h-4 text-green-600" /> 
                            Chi tiết công việc
                        </h3>

                        <div>
                            <label className="text-xs font-semibold text-gray-600 mb-1 block">Vị trí cần tuyển <span className="text-red-500">*</span></label>
                            <Input name="title" placeholder="VD: Nhân viên phục vụ ca tối" required className="bg-gray-50 font-medium" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Mức lương <span className="text-red-500">*</span></label>
                                <Input name="salary" placeholder="VD: 25k/h" required className="bg-gray-50" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600 mb-1 block">Hình thức</label>
                                <select name="type" className="w-full h-10 border rounded-md px-2 text-sm bg-gray-50 outline-none focus:ring-1 focus:ring-green-500 border-input">
                                    <option value="Part-time">Part-time</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Freelance">Freelance</option>
                                </select>
                            </div>
                        </div>

                        <div>
                             <label className="text-xs font-semibold text-gray-600 mb-1 block">Mô tả công việc & Yêu cầu <span className="text-red-500">*</span></label>
                             <Textarea 
                                name="description"
                                className="bg-gray-50 min-h-[100px] text-sm leading-relaxed" 
                                placeholder="- Thời gian làm việc...&#10;- Yêu cầu..."
                                required
                             />
                        </div>
                    </div>
                </form>
            </div>

            <div className="p-4 border-t bg-gray-50 rounded-b-2xl flex gap-3 sticky bottom-0 z-20">
                <Button type="button" variant="outline" className="flex-1 border-gray-300" onClick={() => setShowPostModal(false)}>
                    Hủy bỏ
                </Button>
                <Button 
                    type="submit" 
                    form="post-job-form" 
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-200"
                >
                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                    Đăng tin ngay
                </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};