import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";

// Import các trang (Pages)
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import LocationDetail from "./pages/LocationDetail"; // <-- Nhớ import trang mới này

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <AuthProvider>
          {/* Các thông báo Toast */}
          <Toaster />
          <Sonner />
          
          {/* Định tuyến (Router) */}
         <BrowserRouter>
            <Routes>
              {/* CẢ 2 ĐƯỜNG DẪN NÀY ĐỀU TRỎ VỀ INDEX (BẢN ĐỒ) */}
              <Route path="/" element={<Index />} />
              <Route path="/place/:id" element={<Index />} /> 
              
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          
        </AuthProvider>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;