import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/i18n/LanguageContext';
import { StoreMenuItem, useUserStores } from '@/hooks/useUserStores';

interface MenuItemFormProps {
  storeId: string;
  item?: StoreMenuItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const MenuItemForm = ({ storeId, item, onClose, onSuccess }: MenuItemFormProps) => {
  const { language } = useLanguage();
  const { createMenuItem, updateMenuItem, uploadImage } = useUserStores();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(item?.image_url || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name_vi: item?.name_vi || '',
    name_en: item?.name_en || '',
    description_vi: item?.description_vi || '',
    description_en: item?.description_en || '',
    price: item?.price || 0,
    is_available: item?.is_available ?? true,
    sort_order: item?.sort_order || 0,
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
      let imageUrl = item?.image_url || null;
      
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile, 'menu');
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const menuData = {
        store_id: storeId,
        ...formData,
        image_url: imageUrl,
      };

      if (item) {
        await updateMenuItem(item.id, menuData);
      } else {
        await createMenuItem(menuData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving menu item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-muted/50 rounded-xl p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">
          {item ? (language === 'vi' ? 'Chỉnh sửa món' : 'Edit Item') : (language === 'vi' ? 'Thêm món mới' : 'Add New Item')}
        </h4>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Image */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-3 text-center cursor-pointer hover:border-primary transition-colors"
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg mx-auto" />
          ) : (
            <div className="py-2 text-muted-foreground">
              <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
              <p className="text-xs">{language === 'vi' ? 'Thêm ảnh' : 'Add image'}</p>
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

        {/* Name */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Tên món (VI) *</Label>
            <Input
              value={formData.name_vi}
              onChange={e => setFormData(prev => ({ ...prev, name_vi: e.target.value }))}
              placeholder="Tên món"
              required
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Name (EN)</Label>
            <Input
              value={formData.name_en}
              onChange={e => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
              placeholder="Item name"
              className="h-9"
            />
          </div>
        </div>

        {/* Description */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Mô tả (VI)</Label>
            <Textarea
              value={formData.description_vi}
              onChange={e => setFormData(prev => ({ ...prev, description_vi: e.target.value }))}
              placeholder="Mô tả"
              rows={2}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Description (EN)</Label>
            <Textarea
              value={formData.description_en}
              onChange={e => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
              placeholder="Description"
              rows={2}
              className="text-sm"
            />
          </div>
        </div>

        {/* Price & Availability */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Label className="text-xs flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> {language === 'vi' ? 'Giá (VNĐ)' : 'Price (VND)'}
            </Label>
            <Input
              type="number"
              value={formData.price}
              onChange={e => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
              className="h-9"
            />
          </div>
          <div className="flex items-center gap-2 pb-2">
            <Switch
              checked={formData.is_available}
              onCheckedChange={checked => setFormData(prev => ({ ...prev, is_available: checked }))}
            />
            <Label className="text-xs">{language === 'vi' ? 'Còn hàng' : 'Available'}</Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} size="sm" className="flex-1">
            {language === 'vi' ? 'Hủy' : 'Cancel'}
          </Button>
          <Button type="submit" disabled={isSubmitting} size="sm" className="flex-1">
            {isSubmitting ? '...' : (item ? (language === 'vi' ? 'Cập nhật' : 'Update') : (language === 'vi' ? 'Thêm' : 'Add'))}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
