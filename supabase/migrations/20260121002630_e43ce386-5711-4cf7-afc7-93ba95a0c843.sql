-- Create table for sponsored listings with payment tracking
CREATE TABLE public.sponsored_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL,
  location_name TEXT NOT NULL,
  location_type TEXT NOT NULL,
  stripe_payment_id TEXT,
  stripe_customer_id TEXT,
  amount_paid INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'vnd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  voucher_text TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sponsored_listings ENABLE ROW LEVEL SECURITY;

-- Users can view their own sponsored listings
CREATE POLICY "Users can view own sponsored listings"
ON public.sponsored_listings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert sponsored listings for themselves
CREATE POLICY "Users can create sponsored listings"
ON public.sponsored_listings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending listings
CREATE POLICY "Users can update own sponsored listings"
ON public.sponsored_listings
FOR UPDATE
USING (auth.uid() = user_id);

-- Allow public read access to active sponsored listings (for showing on map)
CREATE POLICY "Anyone can view active sponsored listings"
ON public.sponsored_listings
FOR SELECT
USING (status = 'active');

-- Add updated_at trigger
CREATE TRIGGER update_sponsored_listings_updated_at
BEFORE UPDATE ON public.sponsored_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();