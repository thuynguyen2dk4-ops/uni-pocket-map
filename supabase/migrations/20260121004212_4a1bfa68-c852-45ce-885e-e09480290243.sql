-- Create user_stores table for user-owned businesses
CREATE TABLE public.user_stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name_vi TEXT NOT NULL,
  name_en TEXT,
  description_vi TEXT,
  description_en TEXT,
  address_vi TEXT NOT NULL,
  address_en TEXT,
  phone TEXT,
  category TEXT NOT NULL DEFAULT 'food', -- food, cafe, service, etc.
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  open_hours_vi TEXT,
  open_hours_en TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create store_menu_items table
CREATE TABLE public.store_menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.user_stores(id) ON DELETE CASCADE,
  name_vi TEXT NOT NULL,
  name_en TEXT,
  description_vi TEXT,
  description_en TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create store_vouchers table
CREATE TABLE public.store_vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.user_stores(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title_vi TEXT NOT NULL,
  title_en TEXT,
  description_vi TEXT,
  description_en TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percent', -- percent, fixed
  discount_value INTEGER NOT NULL DEFAULT 0,
  min_order INTEGER DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_vouchers ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_stores
CREATE POLICY "Users can view own stores" ON public.user_stores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view approved stores" ON public.user_stores
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can create own stores" ON public.user_stores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stores" ON public.user_stores
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stores" ON public.user_stores
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for store_menu_items (via store ownership)
CREATE POLICY "Anyone can view menu items of approved stores" ON public.store_menu_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_stores 
      WHERE id = store_id AND (status = 'approved' OR user_id = auth.uid())
    )
  );

CREATE POLICY "Store owners can manage menu items" ON public.store_menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_stores 
      WHERE id = store_id AND user_id = auth.uid()
    )
  );

-- RLS policies for store_vouchers
CREATE POLICY "Anyone can view active vouchers of approved stores" ON public.store_vouchers
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.user_stores 
      WHERE id = store_id AND (status = 'approved' OR user_id = auth.uid())
    )
  );

CREATE POLICY "Store owners can manage vouchers" ON public.store_vouchers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_stores 
      WHERE id = store_id AND user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_user_stores_updated_at
  BEFORE UPDATE ON public.user_stores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for store images
INSERT INTO storage.buckets (id, name, public) VALUES ('store-images', 'store-images', true);

-- Storage policies for store-images bucket
CREATE POLICY "Anyone can view store images" ON storage.objects
  FOR SELECT USING (bucket_id = 'store-images');

CREATE POLICY "Authenticated users can upload store images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'store-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own store images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'store-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own store images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'store-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );