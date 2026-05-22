import React from 'react';
import { cn } from "@/lib/utils";

/**
 * [SRP] Pure UI component - Hiển thị rating sao và số lượng đánh giá.
 * Không có state, không có side-effects.
 *
 * @param {number} rating - Điểm trung bình (0-5, hỗ trợ thập phân)
 * @param {number} count - Tổng số đánh giá
 * @param {'sm'|'md'} size - Kích thước icon sao
 * @param {boolean} showCount - Có hiển thị số lượng không
 * @param {string} className - Custom class
 */
const ReviewStars = ({
    rating = 0,
    count = 0,
    size = 'sm',
    showCount = true,
    className = '',
}) => {
    const MAX_STARS = 5;
    const safeRating = Math.min(Math.max(parseFloat(rating) || 0, 0), 5);
    const starSize = size === 'md' ? 'w-4 h-4' : 'w-3 h-3';

    // [EDGE CASE] Không render gì nếu chưa có đánh giá nào
    if (count === 0 || safeRating === 0) return null;

    return (
        <div className={cn("flex items-center gap-1", className)}>
            {/* Stars render */}
            <div className="flex items-center gap-0.5" aria-label={`${safeRating} trên 5 sao`}>
                {Array.from({ length: MAX_STARS }, (_, i) => {
                    const filled = safeRating >= i + 1;
                    const partial = !filled && safeRating > i && safeRating < i + 1;
                    const fillPercent = partial ? Math.round((safeRating - i) * 100) : 0;

                    return (
                        <span key={i} className={cn("relative inline-block", starSize)}>
                            {/* Empty star base */}
                            <svg viewBox="0 0 20 20" fill="none" className="absolute inset-0 w-full h-full">
                                <path
                                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                    fill="#E5E7EB"
                                />
                            </svg>

                            {/* Filled star (full or partial) */}
                            <svg
                                viewBox="0 0 20 20"
                                fill="none"
                                className="absolute inset-0 w-full h-full"
                                style={{ clipPath: filled ? 'none' : `inset(0 ${100 - fillPercent}% 0 0)` }}
                            >
                                <path
                                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                    fill="#F59E0B"
                                />
                            </svg>
                        </span>
                    );
                })}
            </div>

            {/* Count label */}
            {showCount && (
                <span className="text-[10px] text-gray-400 font-medium leading-none">
                    ({count})
                </span>
            )}
        </div>
    );
};

export default ReviewStars;
