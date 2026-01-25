import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, Loader2, ImagePlus, CheckCircle2, X, Trash2, UploadCloud, Lock, Crown,
  Coffee, GraduationCap, Building, Gamepad2, Home, Briefcase, Utensils, Building2, UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LocationPickerModal } from './LocationPickerModal';

interface StoreFormState {
  name_vi: string;
  address_vi: string;
  phone: string;
  description_vi: string;
  category: string;
  image_url: string;
  lat: number;
  lng: number;
}

interface StoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any; 
  isSubmitting?: boolean;
  customStoreId?: string;
  onUpgradeClick?: () => void; // Callback khi ấn nút nâng cấp
}

export const StoreFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isSubmitting,
  customStoreId,
  onUpgradeClick
}: StoreFormModalProps) => {
  const { session } = useAuth();
  
  // Xác định quyền hạn: Admin hoặc đã mua gói Premium
  const isPremium = (initialData as any)?.is_premium === true;
  const isAdmin = !!customStoreId; // Admin mode
  const canAccessVipFeatures = isPremium || isAdmin;

  const [formData, setFormData] = useState<StoreFormState>({
    name_vi: '', address_vi: '', phone: '',
    description_vi: '', category: 'cafe',
    image_url: '', lat: 21.0285, lng: 105.8542
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<any[]>([]);
  
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name_vi: initialData.name_vi || initialData.nameVi || '',
          address_vi: initialData.address_vi || initialData.address || '',
          phone: initialData.phone || '',
          description_vi: initialData.description_vi || initialData.description || '',
          category: initialData.category || initialData.type || 'cafe',
          image_url: initialData.image_url || initialData.image || '',
          lat: initialData.lat || 21.0285,
          lng: initialData.lng || 105.8542
        });
        setAvatarPreview(initialData.image_url || initialData.image || '');
        setAvatarFile(null);
        
        const targetId = customStoreId || initialData.id;
        if(targetId && canAccessVipFeatures) fetchExistingGallery(targetId);
      } else {
        setFormData({
            name_vi: '', address_vi: '', phone: '',
            description_vi: '', category: 'cafe',
            image_url: '', lat: 21.0285, lng: 105.8542
        });
        setAvatarPreview('');
        setAvatarFile(null);
        setGalleryFiles([]);
        setGalleryPreviews([]);
        setExistingGallery([]);
      }
    }
  }, [isOpen, initialData, customStoreId, canAccessVipFeatures]);

  const handleLocationConfirm = (lat: number, lng: number, address?: string) => {
    setFormData(prev => ({ ...prev, lat, lng, address_vi: address || prev.address_vi }));
    toast.success("Đã cập nhật vị trí!");
  };

  const fetchExistingGallery = async (storeId: string) => {
    const cleanId = String(storeId).replace('user-store-', '');
    const { data } = await (supabase as any)
      .from('store_gallery')
      .select('*')
      .eq('store_id', cleanId);
    if (data) setExistingGallery(data);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const total = existingGallery.length + galleryFiles.length + newFiles.length;
      if (total > 10) {
        toast.error("Tối đa 10 ảnh trong thư viện.");
        return;
      }
      setGalleryFiles(prev => [...prev, ...newFiles]);
      const newUrls = newFiles.map(f => URL.createObjectURL(f));
      setGalleryPreviews(prev => [...prev, ...newUrls]);
    }
  };

  const removeNewImage = (idx: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== idx));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = async (imageId: string) => {
    const { error } = await (supabase as any).from('store_gallery').delete().eq('id', imageId);
    if (!error) {
        setExistingGallery(prev => prev.filter(img => img.id !== imageId));
        toast.success("Đã xóa ảnh.");
    } else {
        toast.error("Lỗi xóa ảnh.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
        let finalImageUrl = formData.image_url;
        if (avatarFile) {
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `avatars/${Date.now()}_avatar.${fileExt}`;
            const { error: uploadError } = await (supabase.storage as any)
                .from('avatars').upload(fileName, avatarFile, { upsert: true });
            if (!uploadError) {
                const { data } = (supabase.storage as any).from('avatars').getPublicUrl(fileName);
                finalImageUrl = data.publicUrl;
            }
        }

        let targetId = customStoreId || initialData?.id;
        const storeDataToSave = {
            id: targetId,
            user_id: session?.user?.id,
            name_vi: formData.name_vi,
            address_vi: formData.address_vi,
            phone: formData.phone,
            description_vi: canAccessVipFeatures ? formData.description_vi : null, // Chỉ lưu mô tả nếu là VIP
            category: formData.category,
            image_url: finalImageUrl,
            lat: formData.lat,
            lng: formData.lng,
            is_premium: customStoreId ? true : (initialData?.is_premium || false)
        };

        const { data: savedStore, error: saveError } = await (supabase as any)
            .from('user_stores')
            .upsert(storeDataToSave)
            .select()
            .single();

        if (saveError) throw saveError;
        if (!targetId && savedStore) targetId = savedStore.id;

        // Chỉ upload gallery nếu là VIP
        if (targetId && galleryFiles.length > 0 && canAccessVipFeatures) {
            let count = 0;
            for (const file of galleryFiles) {
                const fExt = file.name.split('.').pop();
                const fName = `${targetId}/${Date.now()}_${Math.random()}.${fExt}`;
                const { error: upErr } = await (supabase.storage as any).from('avatars').upload(fName, file);
                if (!upErr) {
                    const { data } = (supabase.storage as any).from('avatars').getPublicUrl(fName);
                    await (supabase as any).from('store_gallery').insert({ store_id: targetId, image_url: data.publicUrl });
                    count++;
                }
            }
            if (count > 0) toast.success(`Đã thêm ${count} ảnh vào thư viện!`);
        }

        toast.success(customStoreId ? "Đã cập nhật địa điểm hệ thống!" : "Đã lưu cửa hàng!");
        if (onSubmit) await onSubmit(storeDataToSave);
        onClose();

    } catch (error: any) {
        console.error(error);
        toast.error("Có lỗi xảy ra: " + error.message);
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-0 gap-0 rounded-xl z-[100]">
          
          <DialogHeader className="p-6 border-b sticky top-0 bg-white z-20 flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {customStoreId ? 'Chỉnh sửa Địa điểm (Admin)' : (initialData ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng mới')}
            </DialogTitle>
            
            {canAccessVipFeatures ? (
                 <span className="flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full border border-yellow-200">
                    <Crown className="w-3 h-3 fill-yellow-500 text-yellow-500"/> VIP MEMBER
                 </span>
            ) : (
                 <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Gói Miễn Phí</span>
            )}
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* AVATAR (Miễn phí) */}
              <div className="md:col-span-4 space-y-3">
                <Label className="font-semibold">Ảnh đại diện <span className="text-green-600 text-xs">(Miễn phí)</span></Label>
                <div 
                  className="aspect-square w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all relative overflow-hidden group"
                  onClick={() => document.getElementById('avatar-input')?.click()}
                >
                  {avatarPreview ? (
                    <>
                        <img src={avatarPreview} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <UploadCloud className="text-white w-8 h-8"/>
                            <span className="text-white text-xs font-medium absolute bottom-4">Đổi ảnh</span>
                        </div>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="w-10 h-10 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500 font-medium">Tải ảnh lên</span>
                    </>
                  )}
                  <input id="avatar-input" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </div>
              </div>

              {/* THÔNG TIN CƠ BẢN (Miễn phí) */}
              <div className="md:col-span-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Tên địa điểm <span className="text-red-500">*</span></Label>
                        <Input required value={formData.name_vi} onChange={e => setFormData({...formData, name_vi: e.target.value})} />
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Danh mục <span className="text-red-500">*</span></Label>
                        <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                            <SelectTrigger className="bg-white"><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                            <SelectContent className="max-h-[300px] bg-white z-[200]">
                                <SelectItem value="food">Quán ăn</SelectItem>
                                <SelectItem value="cafe">Café</SelectItem>
                                <SelectItem value="entertainment">Vui chơi</SelectItem>
                                <SelectItem value="lecture_hall">Giảng đường</SelectItem>
                                <SelectItem value="office">Văn phòng</SelectItem>
                                <SelectItem value="housing">Nhà trọ</SelectItem>
                                <SelectItem value="job">Việc làm</SelectItem>
                                <SelectItem value="building">Tòa nhà</SelectItem>
                                <SelectItem value="checkin">Check-in</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Liên hệ & Vị trí</Label>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Số điện thoại..." />
                        </div>
                        <Button type="button" className="bg-blue-600 text-white min-w-[140px] gap-2" onClick={() => setShowMapPicker(true)}>
                            <MapPin className="w-4 h-4"/> {formData.lat ? 'Sửa vị trí' : 'Chọn vị trí'}
                        </Button>
                    </div>
                    <div className="bg-gray-50 border rounded-md p-2 text-sm flex items-start gap-2">
                        <MapPin className={formData.lat ? "w-4 h-4 text-green-600 mt-0.5" : "w-4 h-4 text-gray-400 mt-0.5"} />
                        <span className="font-medium text-gray-800 flex-1">{formData.address_vi || "Chưa chọn vị trí"}</span>
                    </div>
                </div>

                {/* --- TÍNH NĂNG VIP: MÔ TẢ --- */}
                <div className="space-y-2 relative">
                    <Label className="flex items-center gap-2">
                        Mô tả / Giới thiệu 
                        {!canAccessVipFeatures && <Lock className="w-3.5 h-3.5 text-yellow-600"/>}
                    </Label>
                    <div className="relative">
                        <Textarea 
                            rows={3} 
                            value={formData.description_vi} 
                            onChange={e => setFormData({...formData, description_vi: e.target.value})} 
                            disabled={!canAccessVipFeatures}
                            placeholder={!canAccessVipFeatures ? "Nâng cấp VIP để viết mô tả chi tiết, giới thiệu về quán..." : "Nhập mô tả..."}
                            className={!canAccessVipFeatures ? "bg-gray-100 text-gray-400 resize-none blur-[1px]" : ""}
                        />
                        {!canAccessVipFeatures && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <Button type="button" size="sm" onClick={onUpgradeClick} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-md">
                                    <Crown className="w-4 h-4 mr-1"/> Mở khóa Mô tả
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
              </div>

              {/* --- TÍNH NĂNG VIP: GALLERY --- */}
              <div className="col-span-full space-y-3 pt-4 border-t relative">
                 <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold flex items-center gap-2">
                        Thư viện ảnh
                        {!canAccessVipFeatures && <Lock className="w-4 h-4 text-gray-400"/>}
                    </Label>
                    
                    {canAccessVipFeatures ? (
                        <>
                            <Button 
                                type="button" variant="outline" size="sm" 
                                onClick={() => document.getElementById('gallery-input')?.click()}
                                disabled={(existingGallery.length + galleryFiles.length) >= 10}
                            >
                                <ImagePlus className="w-4 h-4 mr-2"/> Thêm ảnh
                            </Button>
                            <input id="gallery-input" type="file" multiple accept="image/*" onChange={handleGalleryChange} className="hidden" />
                        </>
                    ) : (
                        <span className="text-xs text-red-500 font-medium">Tính năng VIP</span>
                    )}
                 </div>
                 
                 <div className={`flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-200 ${!canAccessVipFeatures ? 'opacity-50 pointer-events-none select-none filter blur-[2px]' : ''}`}>
                    {/* (Giữ nguyên logic hiển thị ảnh cũ/mới) */}
                    {existingGallery.length === 0 && galleryFiles.length === 0 && (
                        <div className="w-full h-24 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-lg bg-gray-50 text-sm">
                            Trống
                        </div>
                    )}
                    {existingGallery.map((img) => (
                        <div key={img.id} className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border">
                            <img src={img.image_url} className="w-full h-full object-cover" />
                        </div>
                    ))}
                    {galleryPreviews.map((src, idx) => (
                         <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border">
                            <img src={src} className="w-full h-full object-cover" />
                         </div>
                    ))}
                 </div>

                 {/* OVERLAY KHI KHÔNG PHẢI VIP */}
                 {!canAccessVipFeatures && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl border border-dashed border-gray-300">
                        <div className="bg-white p-4 rounded-2xl shadow-xl flex flex-col items-center border border-yellow-100">
                            <Crown className="w-8 h-8 text-yellow-500 mb-2" />
                            <h3 className="font-bold text-gray-900 text-sm">Thư viện ảnh VIP</h3>
                            <p className="text-xs text-gray-500 mb-3 text-center">Đăng tới 10 ảnh để thu hút khách hàng</p>
                            <Button type="button" size="sm" onClick={onUpgradeClick} className="bg-yellow-500 hover:bg-yellow-600 text-white w-full">
                                Nâng cấp ngay
                            </Button>
                        </div>
                    </div>
                 )}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t sticky bottom-0 bg-white z-20">
               <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
               <Button type="submit" disabled={isUploading || isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                 {(isUploading || isSubmitting) && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                 Lưu thông tin
               </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <LocationPickerModal 
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onConfirm={handleLocationConfirm}
        initialLat={formData.lat}
        initialLng={formData.lng}
      />
    </>
  );
};