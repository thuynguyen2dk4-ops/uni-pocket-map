import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Store, Clock, Phone, Image as ImageIcon, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/i18n/LanguageContext';
import { UserStore, useUserStores } from '@/hooks/useUserStores';
import { LocationPickerModal } from './LocationPickerModal';

interface StoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  store?: UserStore | null;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { value: 'food', labelVi: 'Ăn uống', labelEn: 'Food & Drink' },
  { value: 'cafe', labelVi: 'Cà phê', labelEn: 'Café' },
  { value: 'service', labelVi: 'Dịch vụ', labelEn: 'Service' },
  { value: 'shop', labelVi: 'Cửa hàng', labelEn: 'Shop' },
  { value: 'other', labelVi: 'Khác', labelEn: 'Other' },
];

export const StoreFormModal = ({ isOpen, onClose, store, onSuccess }: StoreFormModalProps) => {
  const { language } = useLanguage();
  const { createStore, updateStore, uploadImage } = useUserStores();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(store?.image_url || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name_vi: store?.name_vi || '',
    name_en: store?.name_en || '',
    description_vi: store?.description_vi || '',
    description_en: store?.description_en || '',
    address_vi: store?.address_vi || '',
    address_en: store?.address_en || '',
    phone: store?.phone || '',
    category: store?.category || 'food',
    lat: store?.lat || 21.0380,
    lng: store?.lng || 105.7828,
    open_hours_vi: store?.open_hours_vi || '',
    open_hours_en: store?.open_hours_en || '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = store?.image_url || null;
      
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, 'stores');
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const storeData = {
        ...formData,
        image_url: imageUrl,
      };

      if (store) {
        await updateStore(store.id, storeData);
      } else {
        await createStore(storeData);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error saving store:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-background rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-background border-b px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              {store ? (language === 'vi' ? 'Chỉnh sửa cửa hàng' : 'Edit Store') : (language === 'vi' ? 'Thêm cửa hàng' : 'Add Store')}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Image upload */}
            <div>
              <Label>{language === 'vi' ? 'Ảnh cửa hàng' : 'Store Image'}</Label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                ) : (
                  <div className="py-8 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{language === 'vi' ? 'Nhấn để tải ảnh lên' : 'Click to upload image'}</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name_vi">Tên (Tiếng Việt) *</Label>
                <Input
                  id="name_vi"
                  value={formData.name_vi}
                  onChange={e => setFormData(prev => ({ ...prev, name_vi: e.target.value }))}
                  placeholder="Tên cửa hàng"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_en">Name (English)</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={e => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                  placeholder="Store name"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <Label>{language === 'vi' ? 'Danh mục' : 'Category'}</Label>
              <Select
                value={formData.category}
                onValueChange={value => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {language === 'vi' ? cat.labelVi : cat.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="desc_vi">Mô tả (Tiếng Việt)</Label>
                <Textarea
                  id="desc_vi"
                  value={formData.description_vi}
                  onChange={e => setFormData(prev => ({ ...prev, description_vi: e.target.value }))}
                  placeholder="Mô tả cửa hàng"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="desc_en">Description (English)</Label>
                <Textarea
                  id="desc_en"
                  value={formData.description_en}
                  onChange={e => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                  placeholder="Store description"
                  rows={3}
                />
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="addr_vi" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Địa chỉ (Tiếng Việt) *
                </Label>
                <Input
                  id="addr_vi"
                  value={formData.address_vi}
                  onChange={e => setFormData(prev => ({ ...prev, address_vi: e.target.value }))}
                  placeholder="Địa chỉ"
                  required
                />
              </div>
              <div>
                <Label htmlFor="addr_en" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Address (English)
                </Label>
                <Input
                  id="addr_en"
                  value={formData.address_en}
                  onChange={e => setFormData(prev => ({ ...prev, address_en: e.target.value }))}
                  placeholder="Address"
                />
              </div>
            </div>

            {/* Location picker */}
            <div>
              <Label className="flex items-center gap-1">
                <Navigation className="w-3 h-3" /> {language === 'vi' ? 'Vị trí trên bản đồ' : 'Location on Map'} *
              </Label>
              <div className="mt-2 p-3 border rounded-xl bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <p className="font-medium">
                      {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'vi' ? 'Nhấn để chọn vị trí trên bản đồ' : 'Click to select location on map'}
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowLocationPicker(true)}
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    {language === 'vi' ? 'Chọn vị trí' : 'Pick Location'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> {language === 'vi' ? 'Số điện thoại' : 'Phone'}
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+84 xxx xxx xxx"
              />
            </div>

            {/* Open hours */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hours_vi" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Giờ mở cửa (Tiếng Việt)
                </Label>
                <Input
                  id="hours_vi"
                  value={formData.open_hours_vi}
                  onChange={e => setFormData(prev => ({ ...prev, open_hours_vi: e.target.value }))}
                  placeholder="7:00 - 22:00"
                />
              </div>
              <div>
                <Label htmlFor="hours_en" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Open Hours (English)
                </Label>
                <Input
                  id="hours_en"
                  value={formData.open_hours_en}
                  onChange={e => setFormData(prev => ({ ...prev, open_hours_en: e.target.value }))}
                  placeholder="7:00 AM - 10:00 PM"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting 
                  ? (language === 'vi' ? 'Đang lưu...' : 'Saving...') 
                  : (store 
                    ? (language === 'vi' ? 'Cập nhật' : 'Update')
                    : (language === 'vi' ? 'Tạo cửa hàng' : 'Create Store')
                  )
                }
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        initialLat={formData.lat}
        initialLng={formData.lng}
        onSelect={(lat, lng, address) => {
          setFormData(prev => ({ 
            ...prev, 
            lat, 
            lng,
            // Auto-fill address if empty
            address_vi: prev.address_vi || address || '',
          }));
        }}
      />
    </AnimatePresence>
  );
};
