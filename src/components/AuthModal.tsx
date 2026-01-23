import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/LanguageContext';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const emailSchema = z.string().email('Email không hợp lệ');
const passwordSchema = z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự');

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Kiểm tra Email và Mật khẩu (Validate) - Giữ nguyên phần của bạn
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      let result;

      // 2. Gọi hàm Login hoặc Signup tùy theo chế độ (Mode)
      if (mode === 'login') {
        console.log("Đang thử đăng nhập với:", email); // <-- Log kiểm tra
        result = await signIn(email, password);
      } else {
        console.log("Đang thử đăng ký với:", email); // <-- Log kiểm tra
        result = await signUp(email, password);
      }

      // 3. In lỗi ra màn hình Console để xem (QUAN TRỌNG)
      console.log("Kết quả từ Supabase:", result);

      // 4. Xử lý kết quả
      if (result.error) {
        // Nếu có lỗi thì hiện thông báo đỏ
        if (result.error.message.includes('Invalid login credentials')) {
          setError(language === 'vi' ? 'Sai email hoặc mật khẩu' : 'Invalid email or password');
        } else if (result.error.message.includes('User already registered')) {
          setError(language === 'vi' ? 'Email này đã được đăng ký' : 'Email already registered');
        } else {
          // Hiện lỗi gốc nếu là lỗi lạ
          setError(result.error.message);
        }
      // Trong AuthModal.tsx, phần else của handleSubmit
} else {
  // Nếu KHÔNG có lỗi -> Thành công
  console.log("Đăng nhập thành công!"); 
  // Thêm dòng này nếu bạn muốn hiện thông báo xanh lá trên màn hình:
  // toast({ title: "Thành công", description: "Đăng nhập thành công!" }); (Cần import toast trước)
  
  onClose(); 
  setEmail('');
  setPassword('');
  if (email === 'admin@gmail.com') {
           // Nếu là admin thì bay thẳng vào trang quản lý
           navigate('/admin');
        }
}
    } catch (err) {
      console.error("Lỗi không mong muốn:", err);
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const texts = {
    vi: {
      login: 'Đăng nhập',
      signup: 'Đăng ký',
      email: 'Email',
      password: 'Mật khẩu',
      noAccount: 'Chưa có tài khoản?',
      hasAccount: 'Đã có tài khoản?',
      signupNow: 'Đăng ký ngay',
      loginNow: 'Đăng nhập',
      welcome: 'Chào mừng bạn',
      createAccount: 'Tạo tài khoản',
      saveFavorites: 'Lưu địa điểm yêu thích trên mọi thiết bị',
    },
    en: {
      login: 'Login',
      signup: 'Sign up',
      email: 'Email',
      password: 'Password',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      signupNow: 'Sign up now',
      loginNow: 'Login',
      welcome: 'Welcome back',
      createAccount: 'Create account',
      saveFavorites: 'Save favorite locations across all devices',
    },
  };

  const t = texts[language];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 pb-4 bg-gradient-to-br from-primary to-primary/80">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {mode === 'login' ? t.welcome : t.createAccount}
            </h2>
            <p className="text-white/80 text-sm mt-1">{t.saveFavorites}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder={t.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 rounded-2xl border-2 text-base"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder={t.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 rounded-2xl border-2 text-base"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-base font-semibold rounded-2xl"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === 'login' ? (
                t.login
              ) : (
                t.signup
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {mode === 'login' ? t.noAccount : t.hasAccount}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                }}
                className="text-primary font-semibold hover:underline"
              >
                {mode === 'login' ? t.signupNow : t.loginNow}
              </button>
            </p>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
