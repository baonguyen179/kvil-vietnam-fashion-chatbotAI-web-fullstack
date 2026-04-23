import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Button } from "@/components/ui/button";
import { removeFromCartLocal, updateQuantityLocal, setCartData } from '@/redux/slices/cartSlice';
import cartService from '@/services/cartService';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + "₫";
};

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems, totalPrice } = useSelector((state) => state.cart);
    const { isAuthenticated } = useSelector((state) => state.auth);

    // Tải dữ liệu giỏ hàng mới nhất khi vào trang
    useEffect(() => {
        const fetchCart = async () => {
            if (isAuthenticated) {
                try {
                    const res = await cartService.getCart();
                    if (res && res.EC === 0) {
                        dispatch(setCartData(res.DT));
                    }
                } catch (error) {
                    console.error("Fetch cart error:", error);
                }
            }
        };
        fetchCart();
        window.scrollTo(0, 0);
    }, [isAuthenticated, dispatch]);

    const updateTimeoutRef = React.useRef({});

    const handleUpdateQuantity = async (id, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return;

        // 1. Cập nhật ngay lập tức vào Redux (Optimistic Update) giúp UI mượt mà
        dispatch(updateQuantityLocal({ id, quantity: newQty }));

        // 2. Nếu đã đăng nhập, sử dụng Debounce để đồng bộ với Database sau 500ms
        if (isAuthenticated) {
            // Xóa timer cũ của item này nếu có
            if (updateTimeoutRef.current[id]) {
                clearTimeout(updateTimeoutRef.current[id]);
            }

            // Đặt timer mới
            updateTimeoutRef.current[id] = setTimeout(async () => {
                try {
                    const res = await cartService.updateCartItem(id, newQty);
                    if (res && res.EC !== 0) {
                        toast.error(res.EM || "Không thể đồng bộ số lượng");
                        // Fallback: Nếu lỗi thì có thể fetch lại giỏ hàng (tùy nhu cầu)
                    }
                } catch (error) {
                    console.error("Sync qty error:", error);
                } finally {
                    delete updateTimeoutRef.current[id];
                }
            }, 500);
        }
    };

    const handleRemoveItem = async (id) => {
        if (isAuthenticated) {
            try {
                const res = await cartService.removeCartItem(id);
                if (res && res.EC === 0) {
                    dispatch(removeFromCartLocal(id));
                    toast.success("Đã xóa sản phẩm");
                }
            } catch (error) {
                console.error("Remove item error:", error);
                toast.error("Lỗi khi xóa sản phẩm");
            }
        } else {
            dispatch(removeFromCartLocal(id));
            toast.success("Đã xóa sản phẩm");
        }
    };

    return (
        <div className="min-h-screen bg-white pb-20 pt-10">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header breadcrumb-like */}
                <div className="flex items-center gap-2 mb-12 animate-in fade-in slide-in-from-left-4 duration-500">
                    <Link to="/" className="text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors">Trang chủ</Link>
                    <span className="text-[10px] text-gray-300">/</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-black font-semibold">Giỏ hàng</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-light tracking-[0.15em] text-black mb-16 text-center md:text-left">
                    GIỎ HÀNG CỦA BẠN
                </h1>

                {cartItems && cartItems.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-16 items-start">
                        {/* List Items */}
                        <div className="flex-1 w-full space-y-8 animate-in fade-in duration-700">
                            <div className="hidden md:grid grid-cols-12 pb-4 border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium">
                                <div className="col-span-6">Sản phẩm</div>
                                <div className="col-span-2 text-center">Số lượng</div>
                                <div className="col-span-3 text-right">Tổng cộng</div>
                                <div className="col-span-1"></div>
                            </div>

                            {cartItems.map((item) => (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center py-8 border-b border-gray-50 group hover:bg-gray-50/50 transition-colors px-4 -mx-4 rounded-xl">
                                    {/* Info */}
                                    <div className="col-span-1 md:col-span-6 flex gap-6">
                                        <div className="w-24 md:w-32 aspect-2/3 shrink-0 bg-gray-50 overflow-hidden rounded-sm shadow-sm transition-transform duration-500 group-hover:scale-[1.02]">
                                            <img 
                                                src={item.variant?.product?.images?.find(img => img.isMain)?.imageUrl || item.variant?.product?.images?.[0]?.imageUrl || "https://placehold.co/200x300"} 
                                                alt={item.variant?.product?.name} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col justify-center space-y-2">
                                            <Link 
                                                // Link chuẩn SEO tương lai
                                                to={`/products/${item.variant?.product?.id}`}
                                                className="text-sm font-bold tracking-tight uppercase hover:text-gray-600 transition-colors line-clamp-2 leading-snug"
                                            >
                                                {item.variant?.product?.name}
                                            </Link>
                                            <div className="space-y-1">
                                                <p className="text-[11px] text-gray-400 uppercase tracking-widest">
                                                    Kích cỡ: <span className="text-black font-medium">{item.variant?.size?.name || 'N/A'}</span>
                                                </p>
                                                <p className="text-[11px] text-gray-400 uppercase tracking-widest">
                                                    Màu sắc: <span className="text-black font-medium">{item.variant?.color?.name || 'N/A'}</span>
                                                </p>
                                            </div>
                                            <div className="flex flex-col">
                                                {item.variant?.product?.discountPercent > 0 ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-red-600">
                                                            {formatCurrency((item.variant?.price || item.variant?.product?.basePrice) * (1 - item.variant.product.discountPercent / 100))}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 line-through">
                                                            {formatCurrency(item.variant?.price || item.variant?.product?.basePrice)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs font-medium">
                                                        {formatCurrency(item.variant?.price || item.variant?.product?.basePrice)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action mobile split */}
                                    <div className="col-span-1 md:col-span-2 flex justify-between md:justify-center items-center">
                                        <span className="md:hidden text-[10px] uppercase tracking-widest text-gray-400">Số lượng:</span>
                                        <div className="flex items-center border border-gray-100 bg-white shadow-sm">
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="w-10 text-center text-xs font-semibold">{item.quantity}</span>
                                            <button 
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="col-span-1 md:col-span-3 flex justify-between md:justify-end items-center">
                                        <span className="md:hidden text-[10px] uppercase tracking-widest text-gray-400">Thành tiền:</span>
                                        <p className="text-sm font-bold tracking-tight">
                                            {(() => {
                                                const base = item.variant?.price || item.variant?.product?.basePrice || 0;
                                                const discount = item.variant?.product?.discountPercent || 0;
                                                const finalPrice = base * (1 - discount / 100);
                                                return formatCurrency(finalPrice * item.quantity);
                                            })()}
                                        </p>
                                    </div>

                                    {/* Delete icon */}
                                    <div className="col-span-1 md:col-span-1 flex justify-end md:justify-center">
                                        <button 
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="p-2 text-gray-300 hover:text-red-500 transition-colors hover:scale-110 duration-300"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Summary Sticky */}
                        <div className="w-full lg:w-96 sticky top-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <div className="bg-white border border-gray-100 p-8 shadow-2xl shadow-gray-100/50 rounded-2xl">
                                <h2 className="text-sm font-bold tracking-[0.2em] uppercase mb-8 border-b border-gray-50 pb-4">Tóm tắt đơn hàng</h2>
                                
                                <div className="space-y-6 mb-10">
                                    <div className="flex justify-between text-xs tracking-wider">
                                        <span className="text-gray-400 uppercase">Tạm tính:</span>
                                        <span className="font-bold">{formatCurrency(totalPrice)}</span>
                                    </div>
                                    <div className="pt-6 border-t border-gray-50 flex justify-between items-baseline">
                                        <span className="text-sm font-bold tracking-[0.2em] uppercase">Tổng cộng:</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-black tracking-tighter">{formatCurrency(totalPrice)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button 
                                        className="w-full h-14 bg-zinc-900 hover:bg-black text-white rounded-xl uppercase text-[11px] tracking-[0.25em] font-bold shadow-lg shadow-zinc-100 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                                        onClick={() => navigate('/checkout')}
                                    >
                                        TIẾN HÀNH THANH TOÁN
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        className="w-full h-14 border-gray-100 hover:bg-gray-50 text-black rounded-xl uppercase text-[11px] tracking-[0.2em] font-medium transition-all"
                                        onClick={() => navigate('/collections')}
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Tiếp tục mua sắm
                                    </Button>
                                </div>

                                <div className="mt-8 pt-8 border-t border-gray-50">
                                    <div className="flex items-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest justify-center">
                                        <span>An toàn</span>
                                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                        <span>Bảo mật</span>
                                        <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                        <span>Nhanh chóng</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8">
                            <ShoppingBag className="h-10 w-10 text-gray-200 stroke-[1px]" />
                        </div>
                        <h2 className="text-xl font-light tracking-[0.2em] text-gray-900 mb-4 uppercase">Giỏ hàng đang trống</h2>
                        <p className="text-gray-400 text-sm font-light tracking-wide max-w-sm mb-12 italic">
                            Hãy khám phá những bộ sưu tập mới nhất và chọn cho mình những bộ trang phục ưng ý nhất.
                        </p>
                        <Button 
                            className="bg-zinc-900 hover:bg-black text-white rounded-full px-12 h-14 uppercase text-[11px] tracking-[0.3em] font-bold transition-all shadow-xl shadow-zinc-100"
                            onClick={() => navigate('/collections')}
                        >
                            Mua sắm ngay
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
