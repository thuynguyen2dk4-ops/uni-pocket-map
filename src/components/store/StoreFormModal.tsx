import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Crown, Image as ImageIcon, Zap, CheckCircle2 } from "lucide-react";
import { CATEGORIES } from "@/types/extended";

interface StoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const StoreFormModal = ({ isOpen, onClose, onSubmit, initialData }: StoreFormModalProps) => {
  const [plan, setPlan] = useState<'free' | 'premium'>('free');

  const [formData, setFormData] = useState({
    name: '',
    category: 'food',
    description: '',
    image: '',
    menuItem: '',
    menuPrice: ''
  });

  const handleSubmit = () => {
    const finalData = {
        ...formData,
        type: plan,
        menu: plan === 'premium' && formData.menuItem ? [{name: formData.menuItem, price: parseInt(formData.menuPrice) || 0}] : [],
        lat: 10.762622, 
        lng: 106.660172
    };
    onSubmit(finalData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo địa điểm mới</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
            <div>
                <Label className="text-base font-semibold mb-3 block">Chọn loại cửa hàng:</Label>
                <div className="grid grid-cols-2 gap-4">
                    <div 
                        onClick={() => setPlan('free')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition relative ${plan === 'free' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'}`}
                    >
                        <div className="font-bold text-gray-800 flex items-center gap-2">Miễn phí <CheckCircle2 size={16} className={plan === 'free' ? 'text-indigo-600' : 'text-transparent'}/></div>
                        <ul className="text-xs text-gray-500 mt-2 space-y-1">
                            <li>✓ Tên & Địa chỉ</li>
                            <li>✓ Mô tả cơ bản</li>
                            <li className="text-gray-400">✗ Không ảnh</li>
                            <li className="text-gray-400">✗ Không menu</li>
                        </ul>
                    </div>
                    <div 
                        onClick={() => setPlan('premium')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition relative ${plan === 'premium' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-yellow-200'}`}
                    >
                        <div className="absolute top-[-10px] right-[-10px] bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">HOT</div>
                        <div className="font-bold text-gray-800 flex items-center gap-1">Premium <Crown size={14} className="text-yellow-600"/></div>
                        <ul className="text-xs text-gray-500 mt-2 space-y-1">
                            <li>✓ Đăng tải ảnh</li>
                            <li>✓ Tạo Menu & Giá</li>
                            <li>✓ Tạo Voucher</li>
                            <li>✓ Ưu tiên hiển thị</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">Tên địa điểm</Label>
                    <Input 
                        id="name" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ví dụ: Quán Cơm Ngon"
                    />
                </div>

                <div className="grid gap-2">
                    <Label>Danh mục</Label>
                    <Select 
                        value={formData.category} 
                        onValueChange={(val) => setFormData({...formData, category: val})}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Mô tả ngắn</Label>
                    <Textarea 
                        id="description" 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                </div>
            </div>

            <div className={`border rounded-lg p-4 space-y-4 transition-all ${plan === 'free' ? 'opacity-50 pointer-events-none bg-gray-50 grayscale' : 'bg-yellow-50/30 border-yellow-200'}`}>
                <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-gray-800 flex items-center gap-1"><ImageIcon size={14}/> Ảnh bìa & Menu (Premium)</span>
                    {plan === 'free' && <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">Khóa</span>}
                </div>
                
                <Input 
                    placeholder="URL hình ảnh..."
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="bg-white"
                />
                
                <div className="grid grid-cols-3 gap-2">
                    <Input 
                        className="col-span-2 bg-white"
                        placeholder="Tên món ăn nổi bật"
                        value={formData.menuItem}
                        onChange={(e) => setFormData({...formData, menuItem: e.target.value})}
                    />
                    <Input 
                        className="bg-white"
                        placeholder="Giá"
                        type="number"
                        value={formData.menuPrice}
                        onChange={(e) => setFormData({...formData, menuPrice: e.target.value})}
                    />
                </div>
            </div>
        </div>

        <DialogFooter>
            <Button variant="outline" onClick={onClose}>Hủy</Button>
            <Button 
                onClick={handleSubmit}
                className={plan === 'premium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600' : 'bg-indigo-600 hover:bg-indigo-700'}
            >
                {plan === 'premium' ? <><Zap size={16} className="mr-2"/> Tạo Cửa Hàng VIP</> : 'Tạo Miễn Phí'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoreFormModal;
