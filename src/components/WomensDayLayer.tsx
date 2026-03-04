import React, { useState, useEffect } from 'react';

const WomensDayLayer = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Tự động tắt sau 15 giây
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 15000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden font-sans">
      
      {/* 1. NỀN (BACKGROUND) - Phong cách trong trẻo, nhẹ nhàng (Light Theme) */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-md animate-in fade-in duration-1000">
        {/* Gradient hồng rất nhạt ở các góc */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-300/30 via-transparent to-rose-300/30"></div>
        {/* Hào quang sáng ấm ở giữa */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-100/60 blur-[100px] rounded-full"></div>
      </div>

      {/* 2. HIỆU ỨNG HOA BAY */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={`flower-${i}`}
            className="absolute animate-float-slow opacity-0"
            style={{
              bottom: '-10%',
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 8 + 8}s`, // Bay lên chậm 8-16s
              animationDelay: `${Math.random() * 5}s`,
              transform: `scale(${Math.random() * 0.6 + 0.6})`,
            }}
          >
            <span className="text-2xl md:text-3xl drop-shadow-sm">
              {['🌸', '🌺', '✨', '💖', '🌷'][i % 5]}
            </span>
          </div>
        ))}
      </div>

      {/* 3. NỘI DUNG CHÍNH */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
        
        {/* ĐIỂM NHẤN 8/3 - Đã sửa lỗi bị cắt xén */}
        <div className="relative mb-4 animate-float-gentle group pointer-events-auto">
          {/* Vầng sáng làm nổi chữ trên nền trắng */}
          <div className="absolute inset-0 bg-white/80 blur-2xl rounded-full scale-125"></div>
          
          {/* Thêm padding-bottom (pb-6) và leading-normal để chữ số không bị cụt */}
          <div className="relative text-8xl md:text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-rose-400 to-pink-600 drop-shadow-[0_4px_10px_rgba(225,29,72,0.2)] font-serif italic flex items-center justify-center tracking-tighter leading-normal pb-6 pt-2 pr-4">
            8/3
            {/* Bó hoa đính kèm góc dưới */}
            <span className="absolute -bottom-2 -right-8 text-6xl md:text-8xl drop-shadow-xl animate-pulse filter contrast-110">
              💐
            </span>
          </div>
        </div>

        {/* LỜI CHÚC - Đổi màu chữ tối hơn để tương phản với nền sáng */}
        <div className="space-y-4 animate-fade-in-up mt-2">
          <h1 className="text-4xl md:text-6xl font-bold text-rose-700 drop-shadow-sm leading-tight py-2 font-serif">
            Quốc Tế Phụ Nữ
          </h1>
          
          <p className="text-rose-800 text-lg md:text-xl font-medium tracking-wide px-6 py-3 max-w-lg mx-auto bg-white/70 rounded-full border border-pink-200 shadow-sm backdrop-blur-md">
            Chúc một nửa thế giới luôn rạng rỡ & hạnh phúc!
          </p>
        </div>

        {/* NÚT ĐÓNG - Thiết kế lại cho hợp tone sáng */}
        <button 
          onClick={() => setIsVisible(false)}
          className="mt-8 pointer-events-auto px-8 py-2.5 border border-pink-300 bg-white/80 text-rose-600 hover:bg-rose-500 hover:text-white hover:border-rose-400 rounded-full transition-all duration-300 shadow-md backdrop-blur-md flex items-center gap-2 font-medium"
        >
          <span>Khám phá bản đồ</span>
          <span className="text-xl">✨</span>
        </button>
      </div>

      {/* CSS CUSTOM ANIMATIONS */}
      <style>{`
        @keyframes floatSlow {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.9; }
          100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
        }
        .animate-float-slow {
          animation: floatSlow linear infinite;
        }

        @keyframes floatGentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float-gentle {
          animation: floatGentle 4s ease-in-out infinite;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default WomensDayLayer;