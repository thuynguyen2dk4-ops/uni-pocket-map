import { motion } from 'framer-motion';
import { ArrowLeft, Map, Search, Ticket, Star, Heart, Mail, MapPin, Globe, Facebook, Phone } from 'lucide-react'; // Đã thêm Phone
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// --- ICON TIKTOK (Tự vẽ vì lucide-react thường không có) ---
const TiktokIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export const AboutPage = () => {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    const element = document.getElementById('features-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: <Search className="w-8 h-8 text-blue-500" />,
      title: "Tìm gì cũng có",
      desc: "Hiểu ý định của bạn: Gõ 'đói', 'khát', 'hết tiền'... hệ thống sẽ tự động gợi ý quán ăn, cafe, ATM phù hợp."
    },
    {
      icon: <Map className="w-8 h-8 text-green-500" />,
      title: "Bản đồ sinh viên",
      desc: "Dữ liệu được tối ưu riêng cho sinh viên: Vị trí giảng đường, thư viện, nhà trọ, và các điểm check-in hot nhất."
    },
    {
      icon: <Ticket className="w-8 h-8 text-orange-500" />,
      title: "Săn Voucher",
      desc: "Liên kết với các cửa hàng quanh trường để tung ra các mã giảm giá độc quyền chỉ dành cho sinh viên."
    },
    {
      icon: <Star className="w-8 h-8 text-yellow-500" />,
      title: "Review Có Tâm",
      desc: "Xem đánh giá thực tế từ cộng đồng sinh viên trước khi quyết định 'xuống tiền' đi ăn hay đi chơi."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-green-100">
      {/* HEADER */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            {/* LOGO TRÊN HEADER */}
            <img src="/logo.png" alt="ThodiaUni" className="w-8 h-8 object-contain rounded" />
            <span className="font-bold text-xl tracking-tight text-green-700">ThodiaUni</span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 hover:bg-green-50 text-green-700">
            <ArrowLeft size={18} />
            Quay lại Bản đồ
          </Button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-200/30 rounded-full blur-3xl -z-10" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold mb-4 inline-block">
             Dành riêng cho Sinh Viên
          </span>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
            Thổ Địa Của <span className="text-green-600">Sinh Viên</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Bạn là tân sinh viên còn bỡ ngỡ? Hay "cựu" sinh viên nhưng trưa nào cũng hỏi "Hôm nay ăn gì?". 
            ThodiaUni chính là người bạn đồng hành giúp bạn làm chủ khu vực quanh trường.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white h-12 px-8 rounded-full text-lg shadow-lg shadow-green-600/20" onClick={() => navigate('/')}>
              Khám phá ngay
            </Button>
            <Button variant="outline" size="lg" className="h-12 px-8 rounded-full text-lg border-2 hover:bg-gray-50" onClick={scrollToFeatures}>
              Tìm hiểu thêm
            </Button>
          </div>
        </motion.div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features-section" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tại sao chọn ThodiaUni?</h2>
            <p className="text-gray-500">Tất cả những gì bạn cần để sống sót qua 4 năm đại học.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="mb-4 bg-gray-50 w-14 h-14 rounded-xl flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION SECTION */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-green-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <Heart className="w-12 h-12 mx-auto mb-6 text-green-200 animate-pulse" />
          <h2 className="text-3xl font-bold mb-4">Sứ Mệnh Của Chúng Tôi</h2>
          <p className="text-lg text-green-100 mb-8 leading-relaxed">
            "Chúng tôi tin rằng đời sinh viên là khoảng thời gian đẹp nhất. ThodiaUni được tạo ra để giúp bạn bớt lo lắng về chuyện ăn ở, đi lại, để dành trọn tâm trí cho việc học tập và trải nghiệm tuổi trẻ."
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-green-200">
             <span className="flex items-center gap-2"><MapPin size={16}/> Làng Đại Học</span>
             <span className="flex items-center gap-2"><Globe size={16}/> Kết nối cộng đồng</span>
          </div>
        </div>
      </section>

      {/* FOOTER - ĐÃ CẬP NHẬT */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* 1. LOGO & TÊN (Cột trái) */}
          <div className="flex items-center gap-2">
            {/* Thay thế div chữ T cũ bằng thẻ img */}
            <img src="/logo.png" alt="ThodiaUni" className="w-8 h-8 object-contain rounded" />
            <span className="text-white font-bold text-xl">ThodiaUni</span>
          </div>
          
          {/* 2. THÔNG TIN LIÊN HỆ HIỆN RÕ CHỮ (Cột giữa) */}
          <div className="text-sm flex flex-col md:flex-row gap-4 md:gap-8 items-center font-medium">
             <div className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                <Mail size={16} className="text-gray-500" />
                <span>contact@thodiauni.space</span>
             </div>
             <div className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                <Phone size={16} className="text-gray-500" />
                <span>086 299 3382</span>
             </div>
          </div>

          {/* 3. MẠNG XÃ HỘI (Cột phải) */}
          <div className="flex gap-6 items-center">
            {/* Facebook */}
            <a 
              href="https://facebook.com/thodiauni" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-blue-500 transition-colors flex items-center gap-1 group"
              title="Facebook"
            >
              <Facebook size={24} className="group-hover:scale-110 transition-transform" />
            </a>

            {/* TikTok */}
            <a 
              href="https://tiktok.com/@thodiauni" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-pink-500 transition-colors flex items-center gap-1 group"
              title="TikTok"
            >
              <TiktokIcon size={22} className="group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-xs text-gray-600">
             © 2026 ThodiaUni Project. Built with passion.
        </div>
      </footer>
    </div>
  );
};