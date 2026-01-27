import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, MapPin, User, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClaimRequest {
  id: string;
  created_at: string;
  user_id: string;
  mapbox_name: string;
  mapbox_address: string;
  message: string;
  proof_image_url: string | null;
  status: string;
  lat: number;
  lng: number;
  mapbox_id: string; // ID của địa điểm trên Mapbox
}

export const AdminStoreClaims = () => {
  const [claims, setClaims] = useState<ClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Lấy danh sách yêu cầu đang chờ (pending)
  const fetchClaims = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('store_claims')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Lỗi tải dữ liệu: " + error.message);
    } else {
      setClaims(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  // 2. Xử lý DUYỆT yêu cầu
  const handleApprove = async (claim: ClaimRequest) => {
    try {
      toast.loading("Đang xử lý...");
      
      // BƯỚC A: Tạo cửa hàng mới trong bảng 'user_stores'
      // Gán user_id của người yêu cầu vào cột owner_id (hoặc user_id tùy database của bạn)
      const { error: createStoreError } = await supabase
        .from('user_stores')
        .insert({
          user_id: claim.user_id, // Quan trọng: Gán quyền chủ sở hữu
          name_vi: claim.mapbox_name,
          address_vi: claim.mapbox_address,
          lat: claim.lat,
          lng: claim.lng,
          category: 'checkin', // Hoặc để mặc định, chủ quán sẽ sửa sau
          is_active: true,
          description_vi: `Địa điểm được xác minh từ Mapbox (ID: ${claim.mapbox_id})`
        });

      if (createStoreError) throw createStoreError;

      // BƯỚC B: Cập nhật trạng thái yêu cầu thành 'approved'
      const { error: updateClaimError } = await supabase
        .from('store_claims')
        .update({ status: 'approved' })
        .eq('id', claim.id);

      if (updateClaimError) throw updateClaimError;

      toast.dismiss();
      toast.success(`Đã duyệt quyền sở hữu cho cửa hàng: ${claim.mapbox_name}`);
      
      // Refresh lại danh sách
      fetchClaims();

    } catch (error: any) {
      toast.dismiss();
      toast.error("Lỗi khi duyệt: " + error.message);
    }
  };

  // 3. Xử lý TỪ CHỐI yêu cầu
  const handleReject = async (id: string) => {
    if (!confirm("Bạn chắc chắn muốn từ chối yêu cầu này?")) return;

    const { error } = await supabase
      .from('store_claims')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) {
      toast.error("Lỗi: " + error.message);
    } else {
      toast.success("Đã từ chối yêu cầu.");
      fetchClaims();
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Yêu cầu xác minh chủ sở hữu ({claims.length})</h2>

      {claims.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-xl text-gray-500">
          Hiện không có yêu cầu nào đang chờ duyệt.
        </div>
      ) : (
        <div className="grid gap-4">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-6">
                
                {/* Cột Trái: Thông tin & Bằng chứng */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2">
                        <MapPin size={18} /> {claim.mapbox_name}
                      </h3>
                      <p className="text-sm text-gray-500">{claim.mapbox_address || "Chưa có địa chỉ"}</p>
                      <p className="text-xs text-gray-400 mt-1 font-mono">ID User: {claim.user_id}</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                      Chờ duyệt
                    </span>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                      <User size={14}/> Lời nhắn từ người dùng:
                    </p>
                    <p className="text-sm text-gray-600 italic">"{claim.message}"</p>
                  </div>

                  {/* Ảnh bằng chứng */}
                  {claim.proof_image_url && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Ảnh bằng chứng:</p>
                      <div className="relative group w-40 h-40 rounded-lg overflow-hidden border border-gray-200 cursor-pointer">
                        <img 
                          src={claim.proof_image_url} 
                          alt="Bằng chứng" 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          onClick={() => window.open(claim.proof_image_url!, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="text-white" size={20} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cột Phải: Hành động */}
                <div className="flex md:flex-col gap-3 justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[150px]">
                  <Button 
                    onClick={() => handleApprove(claim)}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 w-full"
                  >
                    <Check size={16} /> Duyệt
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => handleReject(claim.id)}
                    className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-2 w-full"
                  >
                    <X size={16} /> Từ chối
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};