import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Briefcase, Map, Info, ChevronRight, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

export const MainMenu = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  // Danh sách các link trong Menu
  const menuItems = [
    { 
      icon: <Map className="w-5 h-5 text-blue-500" />, 
      label: "Bản đồ", 
      desc: "Trang chủ tìm kiếm",
      path: "/" 
    },
    { 
      icon: <Briefcase className="w-5 h-5 text-green-600" />, 
      label: "Việc làm", 
      desc: "Tìm việc & Tuyển dụng Free",
      path: "/jobs" 
    },
    { 
      icon: <Info className="w-5 h-5 text-gray-500" />, 
      label: "Giới thiệu", 
      desc: "Về ThodiaUni",
      path: "/about" 
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col h-full">
        {/* HEADER CỦA MENU */}
        <SheetHeader className="p-6 bg-gradient-to-br from-green-50 to-white border-b">
          <SheetTitle className="flex items-center gap-3">
             <img src="/logo.png" className="w-12 h-12 rounded-xl object-contain bg-white shadow-sm border" />
             <div className="text-left">
                <div className="text-green-700 font-black text-xl tracking-tight">ThodiaUni</div>
                <div className="text-xs text-gray-500 font-medium">Menu chính</div>
             </div>
          </SheetTitle>
        </SheetHeader>
        
        {/* DANH SÁCH MENU */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
           {menuItems.map((item, idx) => (
             <Button 
                key={idx} 
                variant="ghost" 
                className="w-full justify-between h-auto py-3 px-3 hover:bg-green-50 rounded-xl group"
                onClick={() => navigate(item.path)}
             >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-800 text-sm">{item.label}</div>
                    <div className="text-[10px] text-gray-500 font-normal">{item.desc}</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-600" />
             </Button>
           ))}
        </div>

        {/* BANNER CHO CHỦ QUÁN Ở CUỐI MENU */}
        <div className="p-4 bg-gray-50 mt-auto border-t">
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                   <Store className="w-4 h-4 text-blue-600" />
                   <h4 className="text-blue-700 font-bold text-sm">Dành cho Chủ Shop</h4>
                </div>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  Đăng tin tuyển dụng nhân viên hoàn toàn <strong>Miễn phí</strong> ngay trên ThodiaUni.
                </p>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8" onClick={() => navigate('/jobs')}>
                    Đăng tin ngay
                </Button>
            </div>
            <div className="text-center mt-4 text-[10px] text-gray-400">
              Ver 1.0.2 • Made with ❤️
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};