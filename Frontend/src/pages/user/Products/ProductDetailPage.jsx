import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
    Plus, 
    Minus, 
    Maximize2, 
    ShoppingBag,
    Loader2,
    Home,
    X
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

import productService from '@/services/productService';
import cartService from '@/services/cartService';
import { toggleCartDrawer, addToCartLocal } from '@/redux/slices/cartSlice';
import ProductCard from '@/components/user/product.card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + "đ";
};

const ProductDetailPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    
    // Related products state
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loadingRelated, setLoadingRelated] = useState(false);

    useEffect(() => {
        fetchProductDetail();
        window.scrollTo(0, 0);
    }, [id]);

    const fetchProductDetail = async () => {
        setLoading(true);
        try {
            const res = await productService.getProductById(id);
            if (res && res.EC === 0) {
                setProduct(res.DT);
                document.title = `${res.DT.name} | KOISAN`;
                const mainImg = res.DT.images?.find(img => img.isMain) || res.DT.images?.[0];
                setActiveImage(mainImg?.imageUrl);
                
                const firstAvailableVariant = res.DT.variants?.find(v => v.stock > 0);
                if (firstAvailableVariant) {
                    setSelectedSize(firstAvailableVariant.size);
                }

                // Sau khi lấy được sản phẩm, tìm sản phẩm liên quan
                fetchRelatedProducts(res.DT);
            } else {
                toast.error(res.EM || "Không tìm thấy sản phẩm");
            }
        } catch (error) {
            console.error("Fetch product detail error:", error);
            toast.error("Lỗi khi tải thông tin sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async (currentProduct) => {
        if (!currentProduct || !currentProduct.name) return;
        
        setLoadingRelated(true);
        try {
            // Trích xuất keyword: Lấy các từ đầu tiên cho tới khi gặp số hoặc hết 2-3 từ
            // Ví dụ: "Áo Blazer 3330650-1" -> "Áo Blazer"
            const nameParts = currentProduct.name.split(' ');
            let keyword = "";
            for (const part of nameParts) {
                // Nếu gặp từ có chứa số thì dừng lại
                if (/\d/.test(part)) break;
                keyword += part + " ";
                // Giới hạn tối đa 3 từ để tránh keyword quá dài
                if (keyword.split(' ').length > 3) break;
            }
            keyword = keyword.trim();

            if (keyword) {
                const res = await productService.searchProducts(keyword, 1, 6);
                if (res && res.EC === 0) {
                    // Lọc bỏ sản phẩm hiện tại khỏi danh sách liên quan
                    const filtered = res.DT.products
                        ?.filter(p => p.id !== currentProduct.id)
                        .slice(0, 5); // Chỉ lấy tối đa 5 sản phẩm
                    setRelatedProducts(filtered || []);
                }
            }
        } catch (error) {
            console.error("Fetch related products error:", error);
        } finally {
            setLoadingRelated(false);
        }
    };

    const pricing = useMemo(() => {
        if (!product) return { current: 0, original: 0, discount: 0 };
        
        const variant = product.variants?.find(v => v.size === selectedSize);
        const original = variant?.price || product.basePrice;
        const discount = product.discountPercent || 0;
        const current = original * (1 - discount / 100);
        
        return { current, original, discount };
    }, [product, selectedSize]);

    const handleQuantityChange = (type) => {
        if (type === 'plus') {
            setQuantity(prev => prev + 1);
        } else {
            if (quantity > 1) {
                setQuantity(prev => prev - 1);
            }
        }
    };

    const handleAddToCart = async () => {
        if (!selectedSize) {
            toast.warn("Vui lòng chọn kích cỡ trước khi thêm vào giỏ hàng");
            return;
        }
        
        const variant = product.variants?.find(v => v.size === selectedSize);
        if (!variant) return;

        if (isAuthenticated) {
            // Trường hợp: Thành viên đã đăng nhập -> Gọi API
            try {
                const res = await cartService.addToCart(variant.id, quantity);
                if (res && res.EC === 0) {
                    toast.success("Đã thêm vào giỏ hàng thành công!");
                    dispatch(toggleCartDrawer(true));
                } else {
                    toast.error(res.EM || "Lỗi khi thêm vào giỏ hàng");
                }
            } catch (error) {
                console.error("Add to cart api error:", error);
                toast.error("Lỗi kết nối máy chủ");
            }
        } else {
            // Trường hợp: Khách vãng lai -> Lưu local Redux
            const item = {
                variant: {
                    id: variant.id,
                    size: variant.size,
                    price: pricing.current,
                    product: {
                        id: product.id,
                        name: product.name,
                        images: product.images
                    }
                },
                quantity: quantity
            };
            dispatch(addToCartLocal(item));
            toast.success("Đã thêm vào giỏ hàng (khách)");
            dispatch(toggleCartDrawer(true));
        }
    };

    if (loading) {
        return (
            <div className="max-w-[1300px] mx-auto px-4 py-10 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <Skeleton className="h-[600px] w-full rounded-none" />
                    <div className="space-y-6">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-12 w-1/2" />
                        <div className="space-y-2">
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-2/3" />
                        </div>
                        <Skeleton className="h-14 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-[1300px] mx-auto px-4 py-10 bg-white flex flex-col items-center justify-center min-h-[400px]">
                <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
                <h2 className="text-xl font-medium text-gray-500">Không tìm thấy sản phẩm</h2>
                <Button variant="link" asChild className="mt-2">
                    <Link to="/collections">Quay lại danh sách</Link>
                </Button>
            </div>
        );
    }

    const currentSku = product.variants?.find(v => v.size === selectedSize)?.sku || product.variants?.[0]?.sku || "N/A";

    return (
        <div className="max-w-[1300px] mx-auto px-4 py-10 bg-white">
            <div className="mb-8">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/" className="flex items-center gap-1">
                                    <Home className="w-3 h-3" /> Trang chủ
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/collections">Sản phẩm</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="font-medium text-black">
                                {product.name}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] lg:grid-cols-[80px_1fr_450px] gap-8">
                {/* 1. Column Left: Thumbnails */}
                <div className="hidden md:flex flex-col gap-3">
                    {product.images?.map((img, idx) => (
                        <div 
                            key={img.id || idx} 
                            className={`w-20 aspect-2/3 cursor-pointer border transition-all overflow-hidden ${
                                activeImage === img.imageUrl ? 'border-black' : 'border-transparent hover:border-gray-300'
                            }`}
                            onClick={() => setActiveImage(img.imageUrl)}
                        >
                            <img src={img.imageUrl} alt={`${product.name} - thumbnail ${idx}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>

                {/* 2. Column Middle: Main Image */}
                <div 
                    className="relative w-full bg-[#f6f6f6] overflow-hidden cursor-zoom-in group"
                    onClick={() => setIsLightboxOpen(true)}
                >
                    <img 
                        src={activeImage} 
                        alt={product.name} 
                        className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 w-11 h-11 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <Maximize2 className="w-5 h-5 text-black" />
                    </div>
                </div>

                {/* 3. Column Right: Details */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight text-[#1c1c19] uppercase">{product.name}</h1>
                        <p className="text-xs text-gray-400 uppercase tracking-wider"> {currentSku}</p>
                    </div>

                    <div className="flex items-baseline gap-4">
                        <span className="text-3xl font-bold text-red-600">{formatCurrency(pricing.current)}</span>
                        {pricing.discount > 0 && (
                            <>
                                <span className="text-lg text-gray-400 line-through">{formatCurrency(pricing.original)}</span>
                                <Badge className="bg-red-600 text-white hover:bg-red-600 rounded-none font-bold px-2 py-0.5">
                                    -{pricing.discount}%
                                </Badge>
                            </>
                        )}
                    </div>

                    <Separator />

                    <div>
                        <span className="text-sm font-bold uppercase mb-3 block tracking-tight">Chọn Size:</span>
                        <div className="flex flex-wrap gap-2">
                            {['S', 'M', 'L', 'XL'].map(size => {
                                const variant = product.variants?.find(v => v.size === size);
                                const isAvailable = variant && variant.stock > 0;
                                
                                return (
                                    <button
                                        key={size}
                                        className={`h-12 w-12 border flex items-center justify-center transition-all font-medium ${
                                            selectedSize === size 
                                            ? 'bg-black text-white border-black' 
                                            : !isAvailable 
                                                ? 'opacity-20 cursor-not-allowed line-through border-gray-200' 
                                                : 'bg-white text-black border-gray-200 hover:border-black'
                                        }`}
                                        disabled={!isAvailable}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <span className="text-sm font-bold uppercase block tracking-tight">Số lượng:</span>
                        <div className="flex items-center border border-gray-200 w-fit">
                            <button 
                                className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 transition-colors" 
                                onClick={() => handleQuantityChange('minus')}
                            >
                                <Minus className="w-4 h-4" />
                            </button>
                            <input 
                                type="text" 
                                className="h-10 w-12 text-center border-x border-gray-200 focus:outline-none text-sm" 
                                value={quantity} 
                                readOnly 
                            />
                            <button 
                                className="h-10 w-10 flex items-center justify-center hover:bg-gray-50 transition-colors" 
                                onClick={() => handleQuantityChange('plus')}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button 
                            className="w-full h-14 bg-black hover:bg-zinc-800 text-white rounded-none uppercase font-bold tracking-widest text-base shadow-xl active:scale-[0.98] transition-all"
                            onClick={handleAddToCart}
                        >
                            <ShoppingBag className="w-5 h-5 mr-3" />
                            Thêm vào giỏ
                        </Button>
                    </div>

                    <div className="pt-6 border-t border-gray-50">
                        <span className="text-sm font-bold uppercase mb-2 block tracking-tight">Mô tả</span>
                        <div className="text-sm text-gray-600 leading-relaxed font-light">
                            <p>{product.description || "Thông tin sản phẩm đang được cập nhật..."}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section: Size Chart */}
            <div className="mt-20 pt-10 border-t border-gray-100">
                <h2 className="text-xl font-bold uppercase mb-8 tracking-tight">Bảng thông số kích thước</h2>
                <div className="w-full overflow-x-auto border border-gray-100 rounded-sm">
                    <table className="w-full text-left text-sm border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 font-bold text-black">Size</th>
                                <th className="p-4 font-bold text-black">Ngực (cm)</th>
                                <th className="p-4 font-bold text-black">Eo (cm)</th>
                                <th className="p-4 font-bold text-black">Mông (cm)</th>
                                <th className="p-4 font-bold text-black">Chiều dài (cm)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[
                                { size: 'S', chest: '82-84', waist: '64-66', hip: '88-90', length: '110' },
                                { size: 'M', chest: '86-88', waist: '68-70', hip: '92-94', length: '112' },
                                { size: 'L', chest: '90-92', waist: '72-74', hip: '96-98', length: '114' },
                                { size: 'XL', chest: '94-96', waist: '76-78', hip: '100-102', length: '116' },
                            ].map((row) => (
                                <tr key={row.size} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 font-bold text-black">{row.size}</td>
                                    <td className="p-4 font-light text-gray-600">{row.chest}</td>
                                    <td className="p-4 font-light text-gray-600">{row.waist}</td>
                                    <td className="p-4 font-light text-gray-600">{row.hip}</td>
                                    <td className="p-4 font-light text-gray-600">{row.length}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-4 text-gray-400 text-[11px] italic">
                    * Lưu ý: Thông số trên chỉ mang tính chất tham khảo. Tùy thuộc vào thiết kế và chất liệu vải mà sẽ có sự sai lệch nhỏ.
                </p>
            </div>

            {/* Bottom Section: Related Products */}
            <div className="mt-24 pt-10 border-t border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold uppercase tracking-tight">Có thể bạn sẽ thích</h2>
                    <Link to="/collections" className="text-sm font-medium text-gray-500 hover:text-black transition-colors underline underline-offset-4">
                        Xem tất cả
                    </Link>
                </div>
                
                {loadingRelated ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex flex-col gap-3">
                                <Skeleton className="aspect-2/3 w-full" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : relatedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {relatedProducts.map(relProduct => (
                            <ProductCard key={relProduct.id} product={relProduct} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg">
                        <p className="text-gray-400 text-sm italic">Đang cập nhật thêm sản phẩm liên quan...</p>
                    </div>
                )}
            </div>

            {/* Lightbox - Phóng to ảnh */}
            {isLightboxOpen && (
                <div 
                    className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-300"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <button 
                        className="absolute top-6 right-6 text-white hover:text-gray-300 p-2 transition-colors z-101"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsLightboxOpen(false);
                        }}
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img 
                        src={activeImage} 
                        alt={product.name} 
                        className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;
