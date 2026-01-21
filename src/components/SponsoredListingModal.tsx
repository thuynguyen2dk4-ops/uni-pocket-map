import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SponsoredListingModalProps {
  storeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SponsoredListingModal({ storeId, open, onOpenChange }: SponsoredListingModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (plan: 'month' | 'year') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: plan === 'month' ? 'price_premium_month' : 'price_premium_year',
          storeId,
          successUrl: window.location.href,
          cancelUrl: window.location.href,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to start checkout",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center font-bold">Upgrade Your Store</DialogTitle>
          <DialogDescription className="text-center text-lg">
            Get more visibility and customers with our premium features
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <Card className="border-2 hover:border-primary/50 transition-colors relative cursor-pointer" onClick={() => handleSubscribe('month')}>
            <CardHeader>
              <CardTitle>Monthly Plan</CardTitle>
              <CardDescription>Flexible commitment</CardDescription>
              <div className="text-3xl font-bold mt-2">50.000đ<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Priority map placement</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Featured store icon</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> 24/7 Support</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={(e) => { e.stopPropagation(); handleSubscribe('month'); }}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Subscribe Monthly
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-2 border-primary shadow-lg relative bg-primary/5 cursor-pointer" onClick={() => handleSubscribe('year')}>
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
              Best Value
            </div>
            <CardHeader>
              <CardTitle>Annual Plan</CardTitle>
              <CardDescription>Save 20%</CardDescription>
              <div className="text-3xl font-bold mt-2">500.000đ<span className="text-sm font-normal text-muted-foreground">/year</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> All Monthly features</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Save on billing</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> "Trusted Partner" badge</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant="default"
                onClick={(e) => { e.stopPropagation(); handleSubscribe('year'); }}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Subscribe Yearly
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
