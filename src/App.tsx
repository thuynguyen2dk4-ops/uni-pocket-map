import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import { AboutPage } from "./pages/AboutPage"; // Import trang vừa tạo
import TetLaserLayer from './components/TetLaserLayer';
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
import { JobsPage } from "./pages/JobsPage";
// --- COMPONENT THEO DÕI CHUYỂN TRANG ---
// Cái này giúp Google Analytics đếm được khi bạn chuyển trang trong React
const RouteTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Kiểm tra xem mã Google đã được cài trong index.html chưa
    if ((window as any).gtag) {
      // Gửi sự kiện page_view với đường dẫn mới
      (window as any).gtag('config', 'G-ZCMPN5RBRS', { // <--- THAY MÃ CỦA BẠN VÀO ĐÂY
        page_path: location.pathname + location.search
      });
    }
  }, [location]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <AuthProvider>
          <TetLaserLayer />
          {/* Các thông báo Toast */}
          <Toaster />
          <Sonner />
          
          {/* Định tuyến (Router) */}
          <BrowserRouter>
            {/* Đặt bộ theo dõi ngay dưới BrowserRouter */}
            <RouteTracker /> 

            <Routes>
              {/* CẢ 2 ĐƯỜNG DẪN NÀY ĐỀU TRỎ VỀ INDEX (BẢN ĐỒ) */}
              <Route path="/" element={<Index />} />
              <Route path="/place/:id" element={<Index />} /> 
              <Route path="/about" element={<AboutPage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/jobs" element={<JobsPage />} />
            </Routes>
          </BrowserRouter>
          
        </AuthProvider>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;