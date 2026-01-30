import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth'; // Đảm bảo hook này trả về { error: ... } hoặc null
import { useLanguage } from '@/i18n/LanguageContext';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Schema validation
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

    // 1. Validate dữ liệu đầu vào (Dùng safeParse cho gọn)
    const emailCheck = emailSchema.safeParse(email);
    if (!emailCheck.success) {
      setError(emailCheck.error.errors[0].message);
      return;
    }

    const passCheck = passwordSchema.safeParse(password);
    if (!passCheck.success) {
      setError(passCheck.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      let result;

      // 2. Gọi hàm Login hoặc Signup
      if (mode === 'login') {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password);
      }

      console.log("Kết quả Auth:", result);

      // 3. Xử lý kết quả
      // Lưu ý: Logic này giả định useAuth của bạn trả về object { error: { message: ... } } khi lỗi
      // Nếu useAuth ném ra lỗi (throw error) thì nó sẽ nhảy xuống phần catch bên dưới.
      
      if (result && result.error) {
        // --- TRƯỜNG HỢP CÓ LỖI ---
        const errMsg = result.error.message || JSON.stringify(result.error);
        
        if (errMsg.includes('Invalid login credentials') || errMsg.includes('auth/invalid-credential')) {
          setError(language === 'vi' ? 'Sai email hoặc mật khẩu' : 'Invalid email or password');
        } else if (errMsg.includes('User already registered') || errMsg.includes('auth/email-already-in-use')) {
          setError(language === 'vi' ? 'Email này đã được đăng ký' : 'Email already registered');
        } else {
          setError(errMsg); // Hiện lỗi gốc
        }
      } else {
        // --- TRƯỜNG HỢP THÀNH CÔNG ---
        console.log("Đăng nhập/Đăng ký thành công!");
        
        // Đóng modal & Reset form
        onClose();
        setEmail('');
        setPassword('');
        setError('');

        // Logic Admin (Hardcode tạm thời)
        if (email === 'admin@gmail.com') {
          navigate('/admin');
        }
      }

    } catch (err: any) {
      // Bắt lỗi nếu signIn/signUp dùng throw error (thường gặp ở Firebase gốc)
      console.error("Lỗi Exception:", err);
      
      let msg = "Có lỗi xảy ra, vui lòng thử lại.";
      // Xử lý lỗi Firebase ở đây nếu cần
      if (err.code === 'auth/invalid-credential') msg = "Sai email hoặc mật khẩu.";
      if (err.code === 'auth/email-already-in-use') msg = "Email này đã được sử dụng.";
      
      setError(msg);
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