import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, MapPin, User, Loader2, Maximize2, Calendar, Store, ArrowRight, AlertTriangle, Phone, Mail, BadgeCheck, ShieldAlert } from 'lucide-react';
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
  profiles?: { email: string }; // Email người yêu cầu (Login)
  
  // Thông tin chủ cũ (nếu tìm thấy)
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
    
    // 1. Lấy danh sách yêu cầu
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

    // 2. Tìm chủ cũ (Check cả Mapbox ID và Vị trí để tìm store cũ chưa có ID)
    const enrichedClaims = await Promise.all((claimsData as any[]).map(async (claim) => {
        // Tìm cửa hàng trùng mapbox_id HOẶC trùng vị trí (sai số nhỏ)
        const { data: existing } = await supabase
            .from('user_stores')
            .select('id, name_vi, user_id, is_verified, profiles:user_id(email)')
            .or(`mapbox_id.eq.${claim.mapbox_id},and(lat.eq.${claim.lat},lng.eq.${claim.lng})`)
            .maybeSingle();

        return {
            ...claim,
            existingStore: existing ? {
                id: existing.id,
                name_vi: existing.name_vi,
                owner_email: existing.profiles?.email || 'Không rõ email',
                is_verified: existing.is_verified
            } : null
        };
    }));

    setClaims(enrichedClaims);
    setLoading(false);
  };

  useEffect(() => { fetchClaims(); }, []);

  // --- LOGIC DUYỆT ---
  const handleApprove = async (claim: ClaimRequest) => {
    let confirmMsg = `Duyệt quyền sở hữu cho "${claim.mapbox_name}"?`;
    
    if (claim.existingStore) {
        confirmMsg = `⚠️ CẢNH BÁO CHUYỂN QUYỀN:\n\nCửa hàng đang thuộc về: ${claim.existingStore.owner_email}\nBạn có chắc chắn muốn chuyển sang cho: ${claim.profiles?.email}?`;
    }

    if (!confirm(confirmMsg)) return;

    try {
      toast.loading("Đang xử lý...");

      if (claim.existingStore) {
        // UPDATE: Chuyển chủ
        const { error } = await supabase.from('user_stores')
          .update({
            user_id: claim.user_id, // Gán cho người mới
            name_vi: claim.mapbox_name, // Cập nhật tên mới nhất
            is_verified: true,
            status: 'approved'
          })
          .eq('id', claim.existingStore.id);
        
        if (error) throw error;
        toast.info(`Đã chuyển quyền sở hữu thành công!`);

      } else {
        // INSERT: Tạo mới
        const { error } = await supabase.from('user_stores')
          .insert({
            user_id: claim.user_id,
            mapbox_id: claim.mapbox_id,
            name_vi: claim.mapbox_name,
            address_vi: claim.mapbox_address,
            lat: claim.lat,
            lng: claim.lng,
            category: 'checkin',
            is_verified: true,
            status: 'approved',
            description_vi: `Xác minh: ${claim.role} - ${claim.phone}`,
            image_url: claim.proof_image_url
          });

        if (error) throw error;
      }

      // Cập nhật trạng thái yêu cầu
      await supabase.from('store_claims').update({ status: 'approved' }).eq('id', claim.id);
      
      // Từ chối các yêu cầu khác trùng lặp
      if (claim.mapbox_id) {
          await supabase.from('store_claims')
            .update({ status: 'rejected' })
            .eq('mapbox_id', claim.mapbox_id)
            .eq('status', 'pending')
            .neq('id', claim.id);
      }

      toast.dismiss();
      toast.success("Thành công!");
      fetchClaims();

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
            <ShieldAlert className="text-orange-500" />
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
              
              {/* HEADER: Tiêu đề & Địa chỉ */}
              <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-start">
                 <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <MapPin className="text-blue-600 w-5 h-5"/> {claim.mapbox_name}
                    </h3>
                    <p className="text-sm text-gray-500 ml-7">{claim.mapbox_address}</p>
                 </div>
                 <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Pending</Badge>
              </div>

              {/* BODY: So sánh Chủ cũ vs Chủ mới */}
              <div className="p-6">
                 {/* KHUNG SO SÁNH (QUAN TRỌNG) */}
                 <div className="flex flex-col md:flex-row gap-4 mb-6">
                    
                    {/* BÊN TRÁI: CHỦ HIỆN TẠI */}
                    <div className={`flex-1 p-4 rounded-lg border-2 ${claim.existingStore ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-dashed border-gray-200'}`}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-3 text-gray-500">
                            {claim.existingStore ? '⚠️ CHỦ SỞ HỮU HIỆN TẠI' : 'CHƯA CÓ CHỦ'}
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
                                <Store size={20}/> Địa điểm mới (Tạo store mới)
                            </div>
                        )}
                    </div>

                    {/* MŨI TÊN */}
                    <div className="flex items-center justify-center">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                            <ArrowRight size={24} />
                        </div>
                    </div>

                    {/* BÊN PHẢI: NGƯỜI YÊU CẦU */}
                    <div className="flex-1 p-4 rounded-lg border-2 border-blue-200 bg-blue-50/50">
                        <p className="text-xs font-bold uppercase tracking-wider mb-3 text-blue-600">NGƯỜI YÊU CẦU (CHỦ MỚI)</p>
                        
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 font-bold text-gray-900">
                                <User size={16} className="text-blue-500"/> {claim.profiles?.email} 
                                <span className="text-gray-400 font-normal text-xs">(Login Email)</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 pl-6 mt-2">
                                <div className="text-gray-600"><span className="font-semibold">Vai trò:</span> {claim.role}</div>
                                <div className="text-gray-600"><span className="font-semibold">SĐT:</span> {claim.phone || '---'}</div>
                                <div className="text-gray-600 col-span-2"><span className="font-semibold">Email LH:</span> {claim.email || '---'}</div>
                            </div>

                            <div className="mt-3 bg-white p-2 rounded border border-blue-100 text-gray-600 italic text-xs">
                                "Lời nhắn: {claim.message || 'Không có'}"
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* PHẦN ẢNH BẰNG CHỨNG */}
                 <div className="border-t pt-4">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-3">ẢNH BẰNG CHỨNG ({claim.proof_images?.length || (claim.proof_image_url ? 1 : 0)})</p>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {/* Ảnh mới (Mảng) */}
                        {claim.proof_images && claim.proof_images.length > 0 ? (
                            claim.proof_images.map((img, idx) => (
                                <div key={idx} className="w-24 h-24 flex-shrink-0 border rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-blue-500 relative bg-gray-100" onClick={() => setSelectedImage(img)}>
                                    <img src={img} className="w-full h-full object-cover" loading="lazy" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors">
                                        <Maximize2 className="text-white opacity-0 hover:opacity-100 w-5 h-5 drop-shadow-md"/>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Ảnh cũ (Fallback)
                            claim.proof_image_url && (
                                <div className="w-24 h-24 flex-shrink-0 border rounded-lg overflow-hidden cursor-pointer" onClick={() => setSelectedImage(claim.proof_image_url!)}>
                                    <img src={claim.proof_image_url} className="w-full h-full object-cover" />
                                </div>
                            )
                        )}
                        
                        {(!claim.proof_images?.length && !claim.proof_image_url) && (
                            <span className="text-sm text-red-400 italic">Người dùng không tải lên ảnh nào.</span>
                        )}
                    </div>
                 </div>
              </div>

              {/* FOOTER: NÚT BẤM */}
              <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
                 <Button variant="outline" onClick={() => handleReject(claim.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                    <X className="w-4 h-4 mr-2"/> Từ chối yêu cầu
                 </Button>
                 <Button onClick={() => handleApprove(claim)} className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
                    <Check className="w-4 h-4 mr-2"/> 
                    {claim.existingStore ? 'Chuyển quyền sở hữu' : 'Duyệt & Tạo cửa hàng'}
                 </Button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX ẢNH */}
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