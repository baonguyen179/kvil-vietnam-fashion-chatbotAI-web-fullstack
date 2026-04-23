import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { X, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toggleCartDrawer, removeFromCartLocal, setCartData } from '@/redux/slices/cartSlice';
import cartService from '@/services/cartService';
import { useEffect } from 'react';


const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + "₫";
};

const CartSheet = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems, totalPrice, isOpen } = useSelector((state) => state.cart);
    const { isAuthenticated } = useSelector((state) => state.auth);

    const handleOpenChange = (open) => {
        dispatch(toggleCartDrawer(open));
    };

    useEffect(() => {
        const fetchCart = async () => {
            if (isOpen && isAuthenticated) {
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
    }, [isOpen, isAuthenticated, dispatch]);

    const handleRemoveItem = async (cartItemId) => {
        if (isAuthenticated) {
            try {
                const res = await cartService.removeCartItem(cartItemId);
                if (res && res.EC === 0) {
                    dispatch(removeFromCartLocal(cartItemId));
                    toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
                } else {
                    toast.error(res.EM || "Lỗi khi xóa sản phẩm");
                }
            } catch (error) {
                console.error("Remove item error:", error);
                toast.error("Lỗi kết nối máy chủ");
            }
        } else {
            // Đối với khách vãng lai, xóa trực tiếp trong Redux
            dispatch(removeFromCartLocal(cartItemId));
            toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetContent 
                side="right" 
                showCloseButton={false}
                className="w-full sm:max-w-[450px] p-0 flex flex-col h-full rounded-none border-l border-gray-100 bg-white"
            >
                {/* 1. Header */}
                <SheetHeader className="px-6 py-6 flex flex-row items-baseline justify-between border-b border-gray-50">
                    <SheetTitle className="text-xl font-light tracking-[0.2em] text-black">
                        GIỎ HÀNG
                    </SheetTitle>
                    <SheetClose className="rounded-none opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none">
                        <X className="h-6 w-6 stroke-[1px]" />
                        <span className="sr-only">Close</span>
                    </SheetClose>
                </SheetHeader>

                {/* 2. Danh sách sản phẩm */}
                <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
                    {cartItems && cartItems.length > 0 ? (
                        <div className="flex flex-col">
                            {cartItems.map((item) => (
                                <div key={item.id} className="py-6 flex gap-4 relative group animate-in slide-in-from-right-4 duration-300">
                                    {/* Thumbnail */}
                                    <div className="w-24 aspect-2/3 shrink-0 bg-gray-50 overflow-hidden">
                                        <img 
                                            src={item.variant?.product?.images?.[0]?.imageUrl || "https://placehold.co/100x150"} 
                                            alt={item.variant?.product?.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Chi tiết sản phẩm */}
                                    <div className="flex-1 flex flex-col justify-between py-1">
                                        <div className="space-y-1 pr-6">
                                            <h3 className="text-sm font-bold tracking-tight uppercase leading-snug line-clamp-2">
                                                {item.variant?.product?.name || "SẢN PHẨM MỚI"}
                                            </h3>
                                            <p className="text-xs text-gray-400 font-light tracking-wide uppercase">
                                                Kích cỡ {item.variant?.size?.name || "S"}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 mt-auto">
                                            <div className="h-7 w-7 flex items-center justify-center bg-gray-100 text-[11px] text-gray-500 font-medium">
                                                {item.quantity || 1}
                                            </div>
                                            <span className="text-sm font-medium tracking-tight">
                                                {formatCurrency(item.variant?.price || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Nút xóa */}
                                    <button 
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="absolute top-6 right-0 p-1 text-black hover:scale-110 transition-transform"
                                    >
                                        <X className="h-4 w-4 stroke-[1.5px]" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                            <ShoppingBag className="h-12 w-12 text-gray-100 mb-4 stroke-[1px]" />
                            <p className="text-gray-400 text-sm font-light tracking-widest italic">Giỏ hàng của bạn đang trống</p>
                            <Button 
                                variant="link" 
                                className="mt-4 uppercase text-xs tracking-widest underline underline-offset-4"
                                onClick={() => {
                                    handleOpenChange(false);
                                    navigate('/collections');
                                }}
                            >
                                Tiếp tục mua sắm
                            </Button>
                        </div>
                    )}
                </div>

                {/* 3 & 4. Summary & Footer */}
                <div className="mt-auto border-t border-black p-6 bg-white">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-sm font-bold tracking-[0.2em]">TỔNG TIỀN:</span>
                        <span className="text-xl font-bold tracking-tight">{formatCurrency(totalPrice || 0)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 h-14">
                        <Button 
                            className="h-full bg-zinc-900 hover:bg-black text-white rounded-none uppercase text-[11px] tracking-[0.2em] font-medium transition-all"
                            onClick={() => {
                                handleOpenChange(false);
                                navigate('/cart');
                            }}
                        >
                            XEM GIỎ HÀNG
                        </Button>
                        <Button 
                            className="h-full bg-zinc-900 hover:bg-black text-white rounded-none uppercase text-[11px] tracking-[0.2em] font-medium transition-all"
                            onClick={() => {
                                handleOpenChange(false);
                                navigate('/checkout');
                            }}
                        >
                            THANH TOÁN
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default CartSheet;
