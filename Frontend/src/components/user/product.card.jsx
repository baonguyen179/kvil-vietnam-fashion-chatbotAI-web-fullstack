import React, { useState, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { encodeId } from '@/utils/idHasher';
import { slugify } from '@/utils/slugify';
import ReviewStars from './review.stars';

const serif = { fontFamily: "'Noto Serif', Georgia, serif" };
const sans = { fontFamily: "'Manrope', Helvetica, sans-serif" };

/**
 * Format currency to Vietnamese Dong
 *  Moved outside to avoid re-creation on every render
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + "đ";
};

const ProductCard = ({ product }) => {
    
    // [SRP] Local state management for UI interaction
    const [selectedSizeId, setSelectedSizeId] = useState(null);

    //  Memoize image objects to avoid recalculation
    const { mainImageUrl, hoverImageUrl } = useMemo(() => {
        const images = product?.images || [];
        const main = images.find(img => img.isMain) || images[0];
        const hover = images.find(img => img !== main) || null;
        return {
            mainImageUrl: main?.imageUrl || "/placeholder-product.png",
            hoverImageUrl: hover?.imageUrl || null
        };
    }, [product?.images]);

    //  Memoize unique sizes and availability
    const { uniqueSizes, variants } = useMemo(() => {
        const variants = product?.variants || [];
        const sizeMap = new Map();
        
        variants.forEach(v => {
            if (v.size && !sizeMap.has(v.sizeId)) {
                sizeMap.set(v.sizeId, {
                    id: v.sizeId,
                    name: v.size.name,
                    stock: v.stock || 0,
                    price: v.price || product.basePrice
                });
            } else if (sizeMap.has(v.sizeId)) {
                // [EDGE CASE] Update stock if multiple colors exist for same size
                const existing = sizeMap.get(v.sizeId);
                existing.stock += (v.stock || 0);
            }
        });

        return {
            uniqueSizes: Array.from(sizeMap.values()),
            variants
        };
    }, [product?.variants, product?.basePrice]);

    const totalStock = useMemo(() => variants.reduce((acc, v) => acc + (v.stock || 0), 0), [variants]);
    const isSoldOut = variants.length === 0 || totalStock === 0;

    //  Dynamic Price Calculation based on selection
    const { currentBasePrice, currentDiscountedPrice, discountPercent } = useMemo(() => {
        const pct = product?.discountPercent || 0;
        let base = product?.basePrice || 0;

        if (selectedSizeId) {
            // Find the variant corresponding to the selected size
            // If multiple colors, we take the price of the first one available
            const selectedVariant = variants.find(v => v.sizeId === selectedSizeId);
            if (selectedVariant && selectedVariant.price) {
                base = selectedVariant.price;
            }
        }

        return {
            currentBasePrice: base,
            currentDiscountedPrice: base * (1 - pct / 100),
            discountPercent: pct
        };
    }, [product?.basePrice, product?.discountPercent, selectedSizeId, variants]);

    const handleSizeClick = (e, sizeId) => {
        e.preventDefault(); // [PROACTIVE] Prevent Link navigation
        e.stopPropagation();
        setSelectedSizeId(prev => prev === sizeId ? null : sizeId);
    };

    return (
        <Link 
            to={`/products/${encodeId(product?.id)}/${slugify(product?.name)}`}
            className={cn(
                "flex flex-col bg-white group cursor-pointer transition-all duration-300 hover:shadow-xl rounded-sm overflow-hidden no-underline",
                isSoldOut && "opacity-90"
            )}
        >
            <div className="relative aspect-2/3 w-full bg-[#f6f6f6] overflow-hidden">
                {/* Badges */}
                <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                    {discountPercent > 0 && !isSoldOut && (
                        <div className="bg-red-600 px-2 py-0.5 shadow-sm">
                            <span className="text-white text-[10px] md:text-xs font-bold font-sans">
                                -{discountPercent}%
                            </span>
                        </div>
                    )}
                </div>

                {isSoldOut && (
                    <div className="absolute top-0 right-0 z-20 bg-[#1c1c19] px-3 py-1.5 shadow-md">
                        <span className="text-white text-[10px] md:text-[11px] font-bold uppercase tracking-widest font-sans">
                            HẾT HÀNG
                        </span>
                    </div>
                )}
                
                {/* Images */}
                <div 
                    className={cn(
                        "absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105",
                        isSoldOut && "grayscale-[0.5]"
                    )}
                    style={{ backgroundImage: `url(${mainImageUrl})` }} 
                />

                {hoverImageUrl && !isSoldOut && (
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
                        style={{ backgroundImage: `url(${hoverImageUrl})` }} 
                    />
                )}

                {/*  Quick Size Selection Overlay on Hover */}
                {!isSoldOut && uniqueSizes.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/90 backdrop-blur-sm z-30">
                        <p className="text-[10px] uppercase tracking-tighter text-gray-400 mb-1 font-bold">Chọn nhanh kích cỡ:</p>
                        <div className="flex flex-wrap gap-1">
                            {uniqueSizes.map((size) => (
                                <button
                                    key={size.id}
                                    onClick={(e) => handleSizeClick(e, size.id)}
                                    disabled={size.stock === 0}
                                    className={cn(
                                        "min-w-[32px] h-8 text-[11px] font-bold border transition-all duration-200",
                                        selectedSizeId === size.id 
                                            ? "bg-black text-white border-black" 
                                            : "bg-transparent text-gray-800 border-gray-200 hover:border-black",
                                        size.stock === 0 && "opacity-30 cursor-not-allowed bg-gray-100"
                                    )}
                                >
                                    {size.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {isSoldOut && (
                    <div className="absolute inset-0 bg-black/5 backdrop-grayscale-[0.5] pointer-events-none" />
                )}
            </div>

            <div className="flex flex-col gap-1.5 p-3.5">
                <div className="flex items-start justify-between gap-2">
                    <h3 
                        className={cn(
                            "text-[#1c1c19] text-sm md:text-[15px] font-medium truncate flex-1 group-hover:text-blue-600 transition-colors",
                            isSoldOut && "text-gray-400"
                        )}
                        title={product?.name}
                        style={sans}
                    >
                        {product?.name}
                    </h3>

                    <ReviewStars
                        rating={product?.ratingAvg}
                        count={product?.reviewCount}
                        size="sm"
                        showCount={false}
                        className="shrink-0 mt-0.5"
                    />
                </div>

                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2.5">
                        <span className={cn(
                            "text-black text-base md:text-lg font-bold tracking-tight",
                            isSoldOut && "text-gray-400"
                        )} style={sans}>
                            {formatCurrency(currentDiscountedPrice)}
                        </span>
                        
                        {discountPercent > 0 && (
                            <span className="text-gray-300 text-xs md:text-sm line-through decoration-gray-300 font-medium" style={sans}>
                                {formatCurrency(currentBasePrice)}
                            </span>
                        )}
                    </div>
                    
                    {/*  Small feedback when a specific size price is shown */}
                    {selectedSizeId && (
                        <span className="text-[10px] italic text-blue-500 font-semibold uppercase tracking-tighter">
                            * Giá theo kích cỡ đã chọn
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
