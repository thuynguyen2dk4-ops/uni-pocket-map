import React, { useState, useEffect } from 'react';

const ValentineLayer = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Tự động tắt sau 15 giây
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 15000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden font-sans">
      
      {/* 1. NỀN (BACKGROUND) - Tông Hồng Tím Lãng Mạn */}
      <div className="absolute inset-0 bg-pink-950/40 backdrop-blur-[3px] animate-in fade-in duration-1000">
        {/* Gradient hồng tím mộng mơ */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-red-500/20"></div>
        {/* Hào quang ở giữa */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-400/20 blur-[120px] rounded-full"></div>
      </div>

      {/* 2. HIỆU ỨNG MƯA TRÁI TIM (Vẽ bằng SVG) */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={`heart-${i}`}
            className="absolute animate-float-up opacity-0"
            style={{
              bottom: '-10%',
              left: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 5 + 6}s`, // Bay lên chậm rãi 6-11s
              animationDelay: `${Math.random() * 5}s`,
              transform: `scale(${Math.random() * 0.5 + 0.5})`, // Kích thước to nhỏ khác nhau
            }}
          >
            {/* Vẽ hình trái tim bằng SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-pink-300/60 drop-shadow-md">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        ))}
      </div>

      {/* 3. NỘI DUNG CHÍNH */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
        
        {/* HÌNH ẢNH TRUNG TÂM - Hiệu ứng nhịp đập (Heartbeat) */}
        {/* Bạn có thể thay thẻ <div> này bằng thẻ <img> nếu muốn dùng ảnh riêng */}
        <div className="mb-6 relative animate-heartbeat group cursor-pointer pointer-events-auto">
            {/* Bóng đổ phát sáng */}
            <div className="absolute inset-0 bg-red-500/40 blur-2xl rounded-full scale-110 group-hover:bg-red-500/60 transition-all"></div>
            
            {/* Dùng Emoji Trái Tim Lớn (Hoặc thay bằng ảnh Cupid/Couple) */}
            <div className="text-9xl md:text-[10rem] drop-shadow-2xl transform transition-transform group-hover:scale-110">
              💖
            </div>
            
            {/* Gợi ý nếu muốn dùng ảnh: */}
            {/* <img src="/valentine-cupid.png" className="h-64 w-auto drop-shadow-2xl" /> */}
        </div>

        {/* TEXT - Font chữ lãng mạn */}
        <div className="space-y-3 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-red-400 to-pink-300 drop-shadow-[0_2px_10px_rgba(255,192,203,0.5)] leading-tight py-2 font-serif italic">
            Happy Valentine
          </h1>
          
          <p className="text-pink-100 text-lg md:text-2xl font-light tracking-[0.2em] uppercase drop-shadow-md">
            Gửi ngàn lời yêu thương
          </p>
        </div>

        {/* Nút đóng */}
        <button 
          onClick={() => setIsVisible(false)}
          className="mt-12 pointer-events-auto px-8 py-2.5 border border-pink-400/30 bg-pink-950/30 text-pink-200 hover:bg-pink-600 hover:text-white hover:border-pink-500 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0.3)] backdrop-blur-md flex items-center gap-2"
        >
          <span>Nhận yêu thương</span>
          <span>♥</span>
        </button>
      </div>

      {/* CSS CUSTOM ANIMATIONS */}
      <style>{`
        /* 1. Tim bay từ dưới lên (Float Up) */
        @keyframes floatUp {
          0% { transform: translateY(100vh) scale(0.5) rotate(0deg); opacity: 0; }
          10% { opacity: 0.8; }
          100% { transform: translateY(-10vh) scale(1) rotate(360deg); opacity: 0; }
        }
        .animate-float-up {
          animation: floatUp linear infinite;
        }

        /* 2. Nhịp tim đập (Heartbeat) */
        @keyframes heartbeat {
          0% { transform: scale(1); }
          14% { transform: scale(1.1); }
          28% { transform: scale(1); }
          42% { transform: scale(1.1); }
          70% { transform: scale(1); }
        }
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite; /* Đập mỗi 1.5s */
        }

        /* 3. Hiện dần lên */
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

export default ValentineLayer;