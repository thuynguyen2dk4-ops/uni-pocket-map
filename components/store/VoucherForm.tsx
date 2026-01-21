import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Percent, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/i18n/LanguageContext';
import { StoreVoucher, useUserStores } from '@/hooks/useUserStores';

interface VoucherFormProps {
  storeId: string;
  voucher?: StoreVoucher | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const VoucherForm = ({ storeId, voucher, onClose, onSuccess }: VoucherFormProps) => {
  const { language } = useLanguage();
  const { createVoucher, updateVoucher } = useUserStores();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    code: voucher?.code || '',
    title_vi: voucher?.title_vi || '',
    title_en: voucher?.title_en || '',
    description_vi: voucher?.description_vi || '',
    description_en: voucher?.description_en || '',
    discount_type: voucher?.discount_type || 'percent',
    discount_value: voucher?.discount_value || 10,
    min_order: voucher?.min_order || 0,
    max_uses: voucher?.max_uses || null,
    is_active: voucher?.is_active ?? true,
    start_date: voucher?.start_date ? new Date(voucher.start_date).toISOString().split('T')[0] : '',
    end_date: voucher?.end_date ? new Date(voucher.end_date).toISOString().split('T')[0] : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const voucherData = {
        store_id: storeId,
        code: formData.code.toUpperCase(),
        title_vi: formData.title_vi,
        title_en: formData.title_en || null,
        description_vi: formData.description_vi || null,
        description_en: formData.description_en || null,
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        min_order: formData.min_order || null,
        max_uses: formData.max_uses || null,
        is_active: formData.is_active,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      };

      if (voucher) {
        await updateVoucher(voucher.id, voucherData);
      } else {
        await createVoucher(voucherData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving voucher:', err);
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
        <h4 className="font-semibold flex items-center gap-2">
          <Tag className="w-4 h-4 text-accent" />
          {voucher ? (language === 'vi' ? 'Chỉnh sửa voucher' : 'Edit Voucher') : (language === 'vi' ? 'Tạo voucher mới' : 'Create New Voucher')}
        </h4>
        <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Code */}
        <div>
          <Label className="text-xs">{language === 'vi' ? 'Mã voucher' : 'Voucher Code'} *</Label>
          <Input
            value={formData.code}
            onChange={e => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="GIAM20"
            required
            className="h-9 uppercase"
          />
        </div>

        {/* Title */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Tiêu đề (VI) *</Label>
            <Input
              value={formData.title_vi}
              onChange={e => setFormData(prev => ({ ...prev, title_vi: e.target.value }))}
              placeholder="Giảm 20%"
              required
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">Title (EN)</Label>
            <Input
              value={formData.title_en}
              onChange={e => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
              placeholder="20% off"
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
              placeholder="Áp dụng cho đơn từ 50k"
              rows={2}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Description (EN)</Label>
            <Textarea
              value={formData.description_en}
              onChange={e => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
              placeholder="Valid for orders over 50k"
              rows={2}
              className="text-sm"
            />
          </div>
        </div>

        {/* Discount type & value */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">{language === 'vi' ? 'Loại giảm giá' : 'Discount Type'}</Label>
            <Select
              value={formData.discount_type}
              onValueChange={value => setFormData(prev => ({ ...prev, discount_type: value }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3 h-3" /> {language === 'vi' ? 'Phần trăm' : 'Percentage'}
                  </span>
                </SelectItem>
                <SelectItem value="fixed">{language === 'vi' ? 'Cố định (VNĐ)' : 'Fixed (VND)'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">
              {language === 'vi' ? 'Giá trị' : 'Value'} {formData.discount_type === 'percent' ? '(%)' : '(VNĐ)'}
            </Label>
            <Input
              type="number"
              value={formData.discount_value}
              onChange={e => setFormData(prev => ({ ...prev, discount_value: parseInt(e.target.value) || 0 }))}
              className="h-9"
            />
          </div>
        </div>

        {/* Min order & max uses */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">{language === 'vi' ? 'Đơn tối thiểu (VNĐ)' : 'Min Order (VND)'}</Label>
            <Input
              type="number"
              value={formData.min_order}
              onChange={e => setFormData(prev => ({ ...prev, min_order: parseInt(e.target.value) || 0 }))}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">{language === 'vi' ? 'Số lần sử dụng tối đa' : 'Max Uses'}</Label>
            <Input
              type="number"
              value={formData.max_uses || ''}
              onChange={e => setFormData(prev => ({ ...prev, max_uses: e.target.value ? parseInt(e.target.value) : null }))}
              placeholder={language === 'vi' ? 'Không giới hạn' : 'Unlimited'}
              className="h-9"
            />
          </div>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">{language === 'vi' ? 'Ngày bắt đầu' : 'Start Date'}</Label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={e => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              className="h-9"
            />
          </div>
          <div>
            <Label className="text-xs">{language === 'vi' ? 'Ngày kết thúc' : 'End Date'}</Label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={e => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              className="h-9"
            />
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={checked => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label className="text-sm">{language === 'vi' ? 'Kích hoạt voucher' : 'Activate voucher'}</Label>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} size="sm" className="flex-1">
            {language === 'vi' ? 'Hủy' : 'Cancel'}
          </Button>
          <Button type="submit" disabled={isSubmitting} size="sm" className="flex-1">
            {isSubmitting ? '...' : (voucher ? (language === 'vi' ? 'Cập nhật' : 'Update') : (language === 'vi' ? 'Tạo' : 'Create'))}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};
