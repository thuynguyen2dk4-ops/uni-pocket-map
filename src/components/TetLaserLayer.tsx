import React, { useState, useEffect } from 'react';

const TetLaserLayer = () => {
  const [isVisible, setIsVisible] = useState(true);

  // Tự động tắt sau 15 giây (tăng thêm chút thời gian để ngắm pháo hoa)
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 15000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden font-sans">
      
      {/* 1. NỀN (BACKGROUND) - Sáng hơn và ấm hơn */}
      {/* Giảm độ tối xuống black/40 và thêm gradient vàng ấm ở giữa */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-1000">
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 via-transparent to-transparent"></div>
        {/* Vầng hào quang ấm áp sau lưng ngựa */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/10 blur-[100px] rounded-full"></div>
      </div>

      {/* 2. HIỆU ỨNG TRANG TRÍ (Pháo hoa & Hoa đào) - Vẽ bằng CSS */}
      <div className="absolute inset-0 overflow-hidden">
        
        {/* Hoa Đào Rơi (Tạo 20 cánh hoa ngẫu nhiên) */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`petal-${i}`}
            className="absolute bg-pink-300/80 rounded-full animate-fall"
            style={{
              width: `${Math.random() * 10 + 5}px`, // Kích thước ngẫu nhiên 5-15px
              height: `${Math.random() * 10 + 5}px`,
              top: '-10%',
              left: `${Math.random() * 100}%`, // Vị trí ngang ngẫu nhiên
              animationDuration: `${Math.random() * 5 + 5}s`, // Tốc độ rơi 5-10s
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          />
        ))}

        {/* Pháo hoa nổ đụp (Dạng đốm sáng nở ra) */}
        {[...Array(6)].map((_, i) => (
          <div 
            key={`firework-${i}`}
            className="absolute rounded-full animate-firework opacity-0"
            style={{
              top: `${Math.random() * 60 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              width: '4px',
              height: '4px',
              backgroundColor: ['#FFD700', '#FF0000', '#00FF00', '#FF00FF'][i % 4], // Các màu pháo hoa
              boxShadow: `0 0 20px 10px ${['#FFD700', '#FF0000', '#00FF00', '#FF00FF'][i % 4]}`,
              animationDelay: `${i * 1.5}s`, // Nổ lần lượt
            }}
          />
        ))}
      </div>

      {/* 3. NỘI DUNG CHÍNH */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
        
        {/* HÌNH ẢNH NGỰA - Thay bounce bằng float (nhún nhẹ) */}
        <div className="mb-2 relative animate-float">
          {/* Vầng sáng sau lưng ngựa để tôn ảnh lên */}
          <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full scale-90"></div>
          
          <img 
            src="/tet-horse-2026.png" 
            alt="Tết Bính Ngọ 2026" 
            className="w-auto h-64 md:h-80 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* TEXT - Chữ đẹp hơn */}
        <div className="space-y-2 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-red-500 drop-shadow-lg leading-tight py-2 uppercase tracking-tighter filter brightness-125">
           Mừng Xuân Bính Ngọ
          </h1>
          
          <div className="flex items-center justify-center gap-3">
             <span className="text-yellow-200 text-2xl">🌸</span>
             <p className="text-white text-xl md:text-2xl font-light tracking-[0.3em] uppercase drop-shadow-md">
               Vạn Sự Như Ý
             </p>
             <span className="text-yellow-200 text-2xl">🌸</span>
          </div>
        </div>

        {/* Nút đóng - Tinh tế hơn */}
        <button 
          onClick={() => setIsVisible(false)}
          className="mt-12 group pointer-events-auto px-6 py-2 bg-black/20 hover:bg-red-600/80 border border-white/20 hover:border-red-500 text-white/60 hover:text-white rounded-full transition-all duration-300 text-sm backdrop-blur-md flex items-center gap-2"
        >
          <span>Vào trang web</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {/* CSS CUSTOM ANIMATIONS (Nhúng trực tiếp vào component để gọn) */}
      <style>{`
        /* 1. Hiệu ứng nhún nhẹ (thay cho bounce) */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        /* 2. Hiệu ứng hoa rơi */
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
          animation: fall linear infinite;
        }

        /* 3. Hiệu ứng pháo hoa đơn giản (Nở ra rồi tắt) */
        @keyframes firework {
          0% { transform: scale(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(30); opacity: 0; } /* Scale to thành vòng tròn lớn rồi biến mất */
        }
        .animate-firework {
          animation: firework 2s ease-out infinite;
        }

        /* 4. Text hiện lên từ từ */
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

export default TetLaserLayer;