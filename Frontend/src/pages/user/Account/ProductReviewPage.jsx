import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, Upload, X, Loader2 } from 'lucide-react';
import reviewService from '@/services/reviewService';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';

const ProductReviewPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [reviewContext, setReviewContext] = useState(null);

    // Form state
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]); // File objects
    const [previews, setPreviews] = useState([]); // For UI display

    useEffect(() => {
        if (!token) {
            toast.error("Thiếu thông tin đánh giá.");
            setLoading(false);
            return;
        }
        handleVerifyToken();
    }, [token]);

    const handleVerifyToken = async () => {
        try {
            const res = await reviewService.verifyReviewToken(token);
            if (res.EC === 0) {
                setReviewContext(res.DT);
            } else {
                toast.error(res.EM || "Link đánh giá không hợp lệ.");
            }
        } catch (error) {
            toast.error("Lỗi xác thực link.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) {
            toast.warning("Bạn chỉ có thể upload tối đa 5 ảnh.");
            return;
        }

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...files]);
        setPreviews(prev => [...prev, ...newPreviews]);
        e.target.value = '';
    };

    const removeImage = (index) => {
        URL.revokeObjectURL(previews[index]);
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Vui lòng chọn số sao.");
            return;
        }

        setSubmitting(true);
        try {
            const res = await reviewService.createReview(token, {
                rating,
                comment,
                images
            });

            if (res.EC === 0) {
                toast.success(res.EM || "Cảm ơn bạn đã đánh giá!");
                setTimeout(() => navigate('/'), 2000);
            } else {
                toast.error(res.EM);
            }
        } catch (error) {
            toast.error("Không thể gửi đánh giá.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-gray-500 font-medium">Đang xác thực link đánh giá...</p>
        </div>
    );

    if (!reviewContext) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <div className="bg-red-50 p-6 rounded-full mb-4 text-red-500">
                <X size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Link không hợp lệ</h2>
            <p className="text-gray-500 max-w-md mt-2">Đường link này đã hết hạn hoặc bạn đã đánh giá sản phẩm này rồi.</p>
            <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-black text-white rounded-md">Về trang chủ</button>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto py-12 px-4">
            <div className="bg-white rounded-2xl shadow-sm border p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Đánh giá sản phẩm</h1>
                <p className="text-gray-500 mb-8">Chia sẻ trải nghiệm của bạn về sản phẩm này nhé!</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Rating Stars */}
                    <div className="flex flex-col items-center gap-3 py-6 bg-gray-50 rounded-xl">
                        <p className="font-semibold text-gray-700">Chất lượng sản phẩm</p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="transition-transform active:scale-90"
                                >
                                    <Star
                                        size={40}
                                        fill={star <= rating ? "#F59E0B" : "none"}
                                        className={cn(star <= rating ? "text-amber-500" : "text-gray-300")}
                                    />
                                </button>
                            ))}
                        </div>
                        <span className="text-sm font-medium text-amber-600">
                            {rating === 5 ? "Rất hài lòng" : rating === 4 ? "Hài lòng" : rating === 3 ? "Bình thường" : rating === 2 ? "Không hài lòng" : "Tệ"}
                        </span>
                    </div>

                    {/* Comment Area */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Nhận xét của bạn</label>
                        <textarea
                            className="w-full min-h-[120px] p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Sản phẩm vải đẹp, form chuẩn, giao hàng nhanh..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-700">Hình ảnh thực tế (Tối đa 5)</label>
                        <div className="flex flex-wrap gap-4">
                            {previews.map((src, idx) => (
                                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                                    <img src={src} alt="preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            
                            {images.length < 5 && (
                                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-gray-400">
                                    <Upload size={24} />
                                    <span className="text-[10px] mt-1 font-medium">Thêm ảnh</span>
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2"
                    >
                        {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                        {submitting ? "Đang gửi đánh giá..." : "Gửi đánh giá ngay"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductReviewPage;
