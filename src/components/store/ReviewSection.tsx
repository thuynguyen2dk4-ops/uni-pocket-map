import { useEffect, useState } from 'react';
import { Star, User, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// 👇 Lấy link Backend
const API_URL = import.meta.env.VITE_API_URL;

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const ReviewSection = ({ storeId }: { storeId: string }) => {
  const { user } = useAuth(); // ✅ Đổi session thành user (Firebase)
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tải danh sách đánh giá
  const fetchReviews = async () => {
    if (!storeId) return;
    const targetId = String(storeId);

    try {
      // 👇 Gọi API Backend
      const res = await fetch(`${API_URL}/api/reviews/list/${targetId}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setReviews(data);
      }
    } catch (error) {
      console.error("Lỗi tải review:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [storeId]);

  // Xử lý gửi đánh giá
  const handleSubmit = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh giá!");
      return;
    }
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    setIsSubmitting(true);
    try {
      const targetId = String(storeId); 

      // 👇 Gọi API POST Review
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: targetId,
          userId: user.uid,
          rating: rating,
          comment: comment
        })
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Cảm ơn đánh giá của bạn!");

      // --- BẮN TÍN HIỆU CẬP NHẬT ---
      window.dispatchEvent(new CustomEvent('review_updated', { detail: targetId }));

      setComment('');
      setRating(5);
      fetchReviews(); 
    } catch (err: any) {
      console.error(err);
      toast.error("Không gửi được đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tính điểm trung bình
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
    : "0.0";

  return (
    <div className="space-y-6">
      
      {/* Thống kê */}
      <div className="bg-orange-50 p-4 rounded-xl flex items-center gap-4 border border-orange-100">
         <div className="text-center">
            <h3 className="text-3xl font-black text-orange-600">{averageRating}</h3>
            <div className="flex gap-0.5 justify-center my-1">
               {[1,2,3,4,5].map(star => (
                 <Star key={star} className={`w-3 h-3 ${star <= Number(averageRating) ? 'fill-orange-500 text-orange-500' : 'text-gray-300'}`} />
               ))}
            </div>
            <p className="text-xs text-gray-500">{reviews.length} đánh giá</p>
         </div>
         <div className="flex-1 h-full w-[1px] bg-orange-200 mx-2"></div>
         <div className="flex-1 text-sm text-gray-600 italic">
            "Hãy để lại đánh giá để giúp cộng đồng tìm được những địa điểm tốt nhất nhé!"
         </div>
      </div>

      {/* Form Viết Đánh Giá */}
      {user ? (
        <div className="bg-white border rounded-xl p-4 shadow-sm">
           <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <User className="w-4 h-4"/> Viết đánh giá của bạn
           </h4>
           
           {/* Chọn sao */}
           <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    className={`w-6 h-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-medium text-gray-500 pt-1">
                {rating === 5 ? 'Tuyệt vời' : rating === 4 ? 'Hài lòng' : rating === 3 ? 'Bình thường' : 'Tệ'}
              </span>
           </div>

           <Textarea 
             placeholder="Chia sẻ trải nghiệm của bạn về địa điểm này..." 
             value={comment}
             onChange={(e) => setComment(e.target.value)}
             className="min-h-[80px] mb-3 bg-gray-50"
           />
           
           <div className="flex justify-end">
             <Button size="sm" onClick={handleSubmit} disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white">
               {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Send className="w-4 h-4 mr-2" />}
               {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
             </Button>
           </div>
        </div>
      ) : (
        <div className="text-center p-4 bg-gray-100 rounded-xl text-sm text-gray-500">
           Vui lòng đăng nhập để viết đánh giá.
        </div>
      )}

      {/* Danh sách đánh giá */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
            <p className="text-center text-gray-400 py-4">Chưa có đánh giá nào.</p>
        ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-0">
                 <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                       <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">U</AvatarFallback>
                       </Avatar>
                       <div>
                          <p className="text-sm font-bold text-gray-900">Người dùng ẩn danh</p>
                          <div className="flex gap-0.5">
                             {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                             ))}
                          </div>
                       </div>
                    </div>
                    <span className="text-[10px] text-gray-400">
                       {new Date(review.created_at).toLocaleDateString('vi-VN')}
                    </span>
                 </div>
                 <p className="text-sm text-gray-600 pl-10 mt-1">{review.comment}</p>
              </div>
            ))
        )}
      </div>

    </div>
  );
};