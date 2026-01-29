import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Check, X, MapPin, User, Loader2, Maximize2, 
  Store, ArrowRight, AlertTriangle, Phone, Mail, BadgeCheck, ImageOff 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ClaimRequest {
  id: string;
  created_at: string;
  user_id: string;
  mapbox_name: string;
  mapbox_address: string;
  message: string;
  proof_image_url: string | null;
  proof_images: string[] | null; 
  phone: string | null;
  email: string | null;
  role: string | null;
  status: string;
  lat: number;
  lng: number;
  mapbox_id: string;
  
  // Login Email (Joined from profiles)
  profiles?: { email: string };
  
  // Thông tin chủ sở hữu hiện tại (nếu có)
  existingStore?: {
    id: any;
    name_vi: string;
    owner_email: string;
    is_verified: boolean;
  };
}

export const AdminStoreClaims = () => {
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchClaims = async () => {
    setLoading(true);
    
    // 1. Lấy tất cả yêu cầu đang chờ (Pending)
    // Lưu ý: profiles:user_id(email) là syntax join bảng của Supabase
    const { data: claimsData, error } = await supabase
      .from('store_claims')
      .select('*, profiles:user_id(email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Lỗi tải yêu cầu: " + error.message);
      setLoading(false);
      return;
    }

    // 2. Kiểm tra xem các cửa hàng này đã có trên hệ thống chưa (Dựa vào Mapbox ID)
    const enrichedClaims = await Promise.all((claimsData as any[]).map(async (claim) => {
        // Tìm cửa hàng trùng mapbox_id
        const { data: existing } = await supabase
            .from('user_stores')
            .select('id, name_vi, user_id, is_verified, profiles:user_id(email)')
            .eq('mapbox_id', claim.mapbox_id)
            .maybeSingle();

        return {
            ...claim,
            existingStore: existing ? {
                id: existing.id,
                name_vi: existing.name_vi,
                owner_email: existing.profiles?.email || 'Không rõ Email',
                is_verified: existing.is_verified
            } : null
        };
    }));

    setClaims(enrichedClaims);
    setLoading(false);
  };

  useEffect(() => { fetchClaims(); }, []);

  // --- LOGIC DUYỆT (APPROVE) ---
  const handleApprove = async (claim: ClaimRequest) => {
    let confirmMsg = `Xác nhận duyệt quyền sở hữu cho "${claim.mapbox_name}"?`;
    
    // Nếu đã có chủ -> Cảnh báo chuyển quyền
    if (claim.existingStore) {
        confirmMsg = `⚠️ CẢNH BÁO QUAN TRỌNG!\n\nĐịa điểm này đang thuộc sở hữu của: ${claim.existingStore.owner_email}\n\nBạn có chắc chắn muốn CHUYỂN QUYỀN SỞ HỮU sang cho: ${claim.profiles?.email}?`;
    }

    if (!confirm(confirmMsg)) return;

    try {
      toast.loading("Đang xử lý...");

      if (claim.existingStore) {
        // TRƯỜNG HỢP 1: Cửa hàng ĐÃ CÓ -> Cập nhật chủ mới (UPDATE)
        const { error: updateError } = await supabase
          .from('user_stores')
          .update({
            user_id: claim.user_id, // Gán user_id người mới
            name_vi: claim.mapbox_name, // Cập nhật tên (nếu muốn)
            is_verified: true,      
            status: 'approved'
          })
          .eq('id', claim.existingStore.id);
        
        if (updateError) throw updateError;
        toast.info(`Đã chuyển quyền sở hữu từ chủ cũ sang chủ mới.`);

      } else {
        // TRƯỜNG HỢP 2: Cửa hàng MỚI -> Tạo mới (INSERT)
        const { error: insertError } = await supabase
          .from('user_stores')
          .insert({
            user_id: claim.user_id,
            mapbox_id: claim.mapbox_id,
            name_vi: claim.mapbox_name,
            address_vi: claim.mapbox_address,
            lat: claim.lat,
            lng: claim.lng,
            category: 'checkin', // Mặc định
            is_verified: true,
            status: 'approved',
            description_vi: `Đã xác minh: ${claim.role}. LH: ${claim.phone}`,
            image_url: claim.proof_image_url
          });

        if (insertError) throw insertError;
      }

      // 3. Cập nhật trạng thái yêu cầu này thành Approved
      await supabase.from('store_claims').update({ status: 'approved' }).eq('id', claim.id);
      
      // 4. Từ chối tất cả các yêu cầu khác cho cùng địa điểm này (nếu có)
      if (claim.mapbox_id) {
        await supabase.from('store_claims')
            .update({ status: 'rejected' })
            .eq('mapbox_id', claim.mapbox_id)
            .eq('status', 'pending')
            .neq('id', claim.id);
      }

      toast.dismiss();
      toast.success("Duyệt thành công!");
      fetchClaims(); // Load lại danh sách

    } catch (error: any) {
      toast.dismiss();
      toast.error("Lỗi: " + error.message);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Từ chối yêu cầu này?")) return;
    await supabase.from('store_claims').update({ status: 'rejected' }).eq('id', id);
    toast.success("Đã từ chối.");
    fetchClaims();
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <BadgeCheck className="text-blue-600" />
            Duyệt xác minh chủ sở hữu ({claims.length})
        </h2>
      </div>

      {claims.length === 0 ? (
        <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed text-gray-400">
          Hiện không có yêu cầu nào đang chờ xử lý.
        </div>
      ) : (
        <div className="grid gap-8">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
              
              {/* HEADER: Tên địa điểm */}
              <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-start">
                 <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <MapPin className="text-blue-600 w-5 h-5"/> {claim.mapbox_name}
                    </h3>
                    <p className="text-sm text-gray-500 ml-7">{claim.mapbox_address}</p>
                 </div>
                 <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200">Pending</Badge>
              </div>

              <div className="p-6">
                 {/* 1. KHUNG SO SÁNH: CHỦ CŨ vs CHỦ MỚI */}
                 <div className="flex flex-col md:flex-row gap-4 mb-6">
                    
                    {/* BÊN TRÁI: HIỆN TRẠNG */}
                    <div className={`flex-1 p-4 rounded-lg border-2 ${claim.existingStore ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-dashed border-gray-200'}`}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-3 text-gray-500">
                            {claim.existingStore ? '⚠️ CHỦ SỞ HỮU HIỆN TẠI' : 'TÌNH TRẠNG: CHƯA CÓ CHỦ'}
                        </p>
                        
                        {claim.existingStore ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-800 font-bold">
                                    <User size={16}/> {claim.existingStore.owner_email}
                                </div>
                                <div className="text-sm text-gray-600 pl-6">
                                    Tên quán: {claim.existingStore.name_vi}
                                </div>
                                {claim.existingStore.is_verified && (
                                    <Badge className="bg-green-100 text-green-700 border-green-200 ml-6">Đã xác minh</Badge>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-400 py-2">
                                <Store size={20}/> Đây là địa điểm mới
                            </div>
                        )}
                    </div>

                    {/* MŨI TÊN CHUYỂN ĐỔI */}
                    <div className="flex items-center justify-center">
                        <div className="bg-blue-50 p-2 rounded-full text-blue-400">
                            <ArrowRight size={24} />
                        </div>
                    </div>

                    {/* BÊN PHẢI: NGƯỜI YÊU CẦU */}
                    <div className="flex-1 p-4 rounded-lg border-2 border-blue-200 bg-blue-50/30">
                        <p className="text-xs font-bold uppercase tracking-wider mb-3 text-blue-600">NGƯỜI YÊU CẦU (CHỦ MỚI)</p>
                        
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 font-bold text-gray-900">
                                <User size={16} className="text-blue-500"/> {claim.profiles?.email || 'Unknown User'} 
                                <span className="text-gray-400 font-normal text-xs">(Login Account)</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-6 mt-2">
                                <div className="text-gray-600"><span className="font-semibold">Vai trò:</span> {claim.role}</div>
                                <div className="text-gray-600"><span className="font-semibold">SĐT:</span> {claim.phone || '---'}</div>
                                <div className="text-gray-600 col-span-2"><span className="font-semibold">Email LH:</span> {claim.email || '---'}</div>
                            </div>

                            <div className="mt-3 bg-white p-2.5 rounded border border-blue-100 text-gray-600 italic text-xs">
                                "Lời nhắn: {claim.message || 'Không có'}"
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* 2. KHUNG ẢNH BẰNG CHỨNG */}
                 <div className="border-t pt-4">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">
                        ẢNH BẰNG CHỨNG ({claim.proof_images?.length || (claim.proof_image_url ? 1 : 0)})
                    </p>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {/* Render mảng ảnh mới */}
                        {claim.proof_images && claim.proof_images.length > 0 ? (
                            claim.proof_images.map((img, idx) => (
                                <div key={idx} className="w-24 h-24 flex-shrink-0 border rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-blue-500 relative bg-gray-100 group" onClick={() => setSelectedImage(img)}>
                                    <img src={img} className="w-full h-full object-cover" loading="lazy" onError={(e) => e.currentTarget.style.display='none'}/>
                                    {/* Fallback khi ảnh lỗi */}
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                        <ImageOff size={20}/>
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                        <Maximize2 className="text-white opacity-0 group-hover:opacity-100 w-5 h-5 drop-shadow-md"/>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Render ảnh cũ (Fallback)
                            claim.proof_image_url && (
                                <div className="w-24 h-24 flex-shrink-0 border rounded-lg overflow-hidden cursor-pointer bg-gray-100" onClick={() => setSelectedImage(claim.proof_image_url!)}>
                                    <img src={claim.proof_image_url} className="w-full h-full object-cover" />
                                </div>
                            )
                        )}
                        
                        {(!claim.proof_images?.length && !claim.proof_image_url) && (
                            <span className="text-sm text-red-400 italic bg-red-50 px-3 py-1 rounded">Người dùng không tải lên ảnh nào.</span>
                        )}
                    </div>
                 </div>
              </div>

              {/* FOOTER ACTIONS */}
              <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
                 <Button variant="outline" onClick={() => handleReject(claim.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                    <X className="w-4 h-4 mr-2"/> Từ chối
                 </Button>
                 <Button onClick={() => handleApprove(claim)} className="bg-green-600 hover:bg-green-700 text-white shadow-sm min-w-[140px]">
                    <Check className="w-4 h-4 mr-2"/> 
                    {claim.existingStore ? 'Chuyển quyền sở hữu' : 'Duyệt & Tạo mới'}
                 </Button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX (Xem ảnh phóng to) */}
      {selectedImage && (
        <div 
            className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedImage(null)}
        >
            <div className="relative max-w-5xl w-full max-h-screen flex items-center justify-center p-2">
                <img 
                    src={selectedImage} 
                    alt="Full Proof" 
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl border border-gray-700" 
                />
                <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition-all"
                >
                    <X size={32} />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};