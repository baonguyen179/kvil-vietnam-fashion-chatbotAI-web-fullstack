import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Star, MessageSquare, Image as ImageIcon } from 'lucide-react';
import reviewService from '@/services/reviewService';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

/**
 * [SRP] Component hiển thị danh sách đánh giá của sản phẩm.
 * Tách biệt logic fetch và render để dễ quản lý.
 */
const ProductReviews = ({ productId, ratingAvg, reviewCount }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 0, totalItems: 0 });

    const fetchReviews = useCallback(async (pageNum) => {
        if (!productId) return;
        setLoading(true);
        try {
            const res = await reviewService.getProductReviews(productId, pageNum, 5);
            console.log("res product reviews:",res);
            if (res && res.EC === 0) {
                setReviews(res.DT.reviews);
                setPagination({
                    totalPages: res.DT.totalPages,
                    totalItems: res.DT.totalItems
                });
            }
        } catch (error) {
            console.error("Lỗi khi tải đánh giá:", error);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchReviews(1);
        setPage(1);
    }, [productId, fetchReviews]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchReviews(newPage);
        // Scroll to review section top if needed
        const element = document.getElementById('reviews-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (reviewCount === 0 && !loading) {
        return (
            <div className="mt-16 py-12 border-t border-gray-100 text-center bg-gray-50/50 rounded-sm">
                <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Chưa có đánh giá nào</h3>
                <p className="text-xs text-gray-400 mt-1">Hãy là người đầu tiên chia sẻ cảm nhận về sản phẩm này!</p>
            </div>
        );
    }

    return (
        <div id="reviews-section" className="mt-24 pt-10 border-t border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                <div>
                    <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
                        Đánh giá từ khách hàng 
                        <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {reviewCount}
                        </span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Mọi đánh giá đều đến từ khách hàng đã mua sản phẩm này.</p>
                </div>

                <div className="flex items-center gap-6 bg-gray-50 p-6 rounded-sm border border-gray-100">
                    <div className="text-center pr-6 border-r border-gray-200">
                        <div className="text-4xl font-black text-black leading-none mb-1">{Number(ratingAvg).toFixed(1)}</div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">Trên 5 sao</div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                    key={star} 
                                    size={16} 
                                    fill={star <= Math.round(ratingAvg) ? "#F59E0B" : "none"} 
                                    className={star <= Math.round(ratingAvg) ? "text-amber-500" : "text-gray-200"} 
                                />
                            ))}
                        </div>
                        <div className="text-xs font-bold text-amber-600 uppercase tracking-tight">
                            {ratingAvg >= 4.5 ? 'Rất tuyệt vời' : ratingAvg >= 4 ? 'Hài lòng' : 'Đáng mua'}
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Đang tải đánh giá...</p>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {reviews.map((review) => (
                        <div key={review.id} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                        {review.user?.avatar ? (
                                            <img src={review.user.avatar} alt={review.user.fullName} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-bold text-gray-400">
                                                {review.user?.fullName?.charAt(0) || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-black flex items-center gap-2">
                                            {review.user?.fullName || 'Khách vãng lai'}
                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                            <span className="text-[10px] text-gray-400 font-normal">
                                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <div className="flex gap-0.5 mt-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star 
                                                    key={star} 
                                                    size={10} 
                                                    fill={star <= review.rating ? "#F59E0B" : "none"} 
                                                    className={star <= review.rating ? "text-amber-500" : "text-gray-200"} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pl-0 md:pl-[52px]">
                                <p className="text-sm text-gray-700 leading-relaxed font-light italic">
                                    "{review.comment || 'Khách hàng không để lại nhận xét.'}"
                                </p>

                                {review.images && review.images.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {review.images.map((img, idx) => (
                                            <div key={idx} className="w-20 h-20 rounded-sm overflow-hidden border border-gray-100 hover:border-black transition-all cursor-pointer group">
                                                <img 
                                                    src={img.imageUrl} 
                                                    alt="Review detail" 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Separator className="bg-gray-50" />
                        </div>
                    ))}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={cn(
                                        "w-10 h-10 text-xs font-bold transition-all border",
                                        page === pageNum 
                                            ? "bg-black text-white border-black" 
                                            : "bg-white text-gray-500 border-gray-100 hover:border-black"
                                    )}
                                >
                                    {pageNum}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
