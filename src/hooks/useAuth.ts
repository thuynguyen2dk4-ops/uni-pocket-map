import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    // KIỂM TRA CHẾ ĐỘ DEMO
    // Nếu app đang chạy với URL giả (placeholder) do chưa cấu hình .env
    // @ts-ignore
    const isDemo = supabase.supabaseUrl?.includes('placeholder');

    if (isDemo) {
      console.log("Auth: Đang chạy chế độ Demo (Không có Backend thực)");
      setIsLoading(false);
      return;
    }

    // Logic lấy session thật (chỉ chạy khi đã cấu hình Supabase)
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Lỗi Auth:", error);
        if (mounted) setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Hàm đăng nhập hỗ trợ cả Demo và Thật
  const signIn = async (email: string) => {
    // 1. XỬ LÝ ĐĂNG NHẬP DEMO
    // @ts-ignore
    const isDemo = supabase.supabaseUrl?.includes('placeholder');
    
    if (isDemo) {
        toast({
            title: "Đăng nhập Demo",
            description: "Đang vào hệ thống với quyền Admin (Giả lập)...",
        });

        // Tạo một session giả để lừa app rằng đã đăng nhập
        const mockSession = {
            access_token: "demo_token_123",
            refresh_token: "demo_refresh_123",
            expires_in: 3600,
            token_type: "bearer",
            user: {
                id: "demo_admin_user_id",
                email: email || "admin@demo.com",
                aud: "authenticated",
                role: "authenticated",
                created_at: new Date().toISOString(),
            }
        } as unknown as Session;

        // Giả lập độ trễ mạng 1 giây
        setTimeout(() => {
            setSession(mockSession);
            toast({
                title: "Thành công (Demo)",
                description: "Bạn đã đăng nhập thành công vào chế độ xem trước.",
            });
        }, 1000);
        return;
    }

    // 2. XỬ LÝ ĐĂNG NHẬP THẬT (OTP qua Email)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      toast({
        title: "Đã gửi link đăng nhập",
        description: "Vui lòng kiểm tra email của bạn để lấy Magic Link.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Lỗi đăng nhập",
        description: error.message,
      });
    }
  };

  const signOut = async () => {
    // Xử lý đăng xuất Demo
    // @ts-ignore
    const isDemo = supabase.supabaseUrl?.includes('placeholder');
    if (isDemo) {
        setSession(null);
        toast({ title: "Đã đăng xuất (Demo)" });
        return;
    }

    // Đăng xuất thật
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Lỗi đăng xuất",
        description: error.message,
      });
    } else {
        setSession(null);
    }
  };

  return { session, isLoading, signIn, signOut };
};
