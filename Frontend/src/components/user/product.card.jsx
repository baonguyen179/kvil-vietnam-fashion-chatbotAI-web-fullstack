import { cn } from "@/lib/utils";
import { Link } from 'react-router-dom';
import { encodeId } from '@/utils/idHasher';
import { slugify } from '@/utils/slugify';

const serif = { fontFamily: "'Noto Serif', Georgia, serif" };
const sans = { fontFamily: "'Manrope', Helvetica, sans-serif" };

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + "đ";
};

const ProductCard = ({ product }) => {
    const images = product?.images || [];
    const mainImgObj = images.find(img => img.isMain) || images[0];
    const hoverImgObj = images.find(img => img !== mainImgObj) || null;

    const mainImageUrl = mainImgObj?.imageUrl || "/placeholder-product.png";
    const hoverImageUrl = hoverImgObj?.imageUrl || null;

    const discountPercent = product?.discountPercent || 0;
    const basePrice = product?.basePrice || 0;
    const discountedPrice = basePrice * (1 - discountPercent / 100);

    return (
        <Link 
            to={`/products/${encodeId(product?.id)}/${slugify(product?.name)}`}
            className="flex flex-col bg-white group cursor-pointer transition-all duration-300 hover:shadow-lg rounded-sm overflow-hidden no-underline"
        >
            <div className="relative aspect-2/3 w-full bg-[#f6f6f6] overflow-hidden">
                {discountPercent > 0 && (
                    <div className="absolute top-2 left-2 z-20 bg-white px-2 py-1 shadow-sm">
                        <span className="text-[#ff0000] text-[10px] md:text-xs font-bold font-sans">
                            -{discountPercent}%
                        </span>
                    </div>
                )}
                
                <div 
                    className={cn(
                        "absolute inset-0 bg-cover bg-center transition-transform duration-700",
                        !hoverImageUrl && "group-hover:scale-105" 
                    )}
                    style={{ backgroundImage: `url(${mainImageUrl})` }} 
                />

                {hoverImageUrl && (
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
                        style={{ backgroundImage: `url(${hoverImageUrl})` }} 
                    />
                )}
            </div>

            <div className="flex flex-col gap-2 p-3">
                <h3 
                    className="text-[#1c1c19] text-sm md:text-base font-normal truncate w-full" 
                    title={product?.name}
                    style={sans}
                >
                    {product?.name}
                </h3>

                <div className="flex items-center gap-3">
                    <span className="text-[#ff5c00] text-sm md:text-lg font-bold" style={sans}>
                        {formatCurrency(discountedPrice)}
                    </span>
                    
                    {discountPercent > 0 && (
                        <span className="text-gray-400 text-xs md:text-sm line-through decoration-gray-400" style={sans}>
                            {formatCurrency(basePrice)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
