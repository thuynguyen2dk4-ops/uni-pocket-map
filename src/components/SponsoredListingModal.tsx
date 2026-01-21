import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSponsoredListing, sponsoredPackages, SponsoredPackage } from '@/hooks/useSponsoredListing';
import { useLanguage } from '@/i18n/LanguageContext';
import { Loader2, Zap, Star, Crown, Tag } from 'lucide-react';

interface SponsoredListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    id: string;
    name: string;
    nameVi: string;
    type: string;
  } | null;
}

export const SponsoredListingModal = ({ isOpen, onClose, location }: SponsoredListingModalProps) => {
  const { language } = useLanguage();
  const { createCheckout, isLoading } = useSponsoredListing();
  const [selectedPackage, setSelectedPackage] = useState<string>('standard');
  const [voucherText, setVoucherText] = useState('');

  if (!location) return null;

  const handlePayment = async () => {
    const locationName = language === 'vi' ? location.nameVi : location.name;
    await createCheckout(
      location.id,
      locationName,
      location.type,
      selectedPackage,
      voucherText
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getPackageIcon = (id: string) => {
    switch (id) {
      case 'basic':
        return <Zap className="h-5 w-5" />;
      case 'standard':
        return <Star className="h-5 w-5" />;
      case 'premium':
        return <Crown className="h-5 w-5" />;
      default:
        return <Zap className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {language === 'vi' ? 'Quảng cáo địa điểm' : 'Promote Location'}
          </DialogTitle>
          <DialogDescription>
            {language === 'vi' 
              ? `Tăng độ hiển thị cho "${location.nameVi}" trên bản đồ`
              : `Increase visibility for "${location.name}" on the map`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid gap-3">
            {sponsoredPackages.map((pkg: SponsoredPackage) => (
              <Card 
                key={pkg.id}
                className={`cursor-pointer transition-all ${
                  selectedPackage === pkg.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPackageIcon(pkg.id)}
                      <CardTitle className="text-base">
                        {language === 'vi' ? pkg.name : pkg.nameEn}
                      </CardTitle>
                    </div>
                    <Badge variant={pkg.id === 'premium' ? 'default' : 'secondary'}>
                      {formatPrice(pkg.price)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription>
                    {language === 'vi' ? pkg.description : pkg.descriptionEn}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPackage === 'premium' && (
            <div className="space-y-2">
              <Label htmlFor="voucher" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {language === 'vi' ? 'Nội dung voucher (tùy chọn)' : 'Voucher text (optional)'}
              </Label>
              <Input
                id="voucher"
                placeholder={language === 'vi' ? 'VD: Giảm 20% cho sinh viên' : 'E.g. 20% off for students'}
                value={voucherText}
                onChange={(e) => setVoucherText(e.target.value)}
                maxLength={50}
              />
            </div>
          )}

          <Button 
            onClick={handlePayment} 
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === 'vi' ? 'Đang xử lý...' : 'Processing...'}
              </>
            ) : (
              language === 'vi' ? 'Tiến hành thanh toán' : 'Proceed to payment'
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {language === 'vi' 
              ? 'Thanh toán an toàn qua Stripe. Hỗ trợ Visa, Mastercard, và nhiều phương thức khác.'
              : 'Secure payment via Stripe. Supports Visa, Mastercard, and more.'
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
