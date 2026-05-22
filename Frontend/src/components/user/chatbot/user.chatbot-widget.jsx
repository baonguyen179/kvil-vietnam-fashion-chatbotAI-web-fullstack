import React, { useState, useEffect, Suspense, lazy } from 'react';
import { MessageSquare, X, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

// Lazy load ChatWindow to optimize initial page load
const UserChatbotWindow = lazy(() => import('./user.chatbot-window'));

/**
 * [SENIOR COMPONENT] UserChatbotWidget
 * The floating entry point for the AI Chatbot.
 * Features: 
 * - Auto-opens after 10s delay.
 * - Lazy loads the main chat UI.
 * - Consistent naming pattern: user.chatbot-widget.jsx
 */
const UserChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

    const location = useLocation();
    const isCartOpen = useSelector((state) => state.cart?.isOpen);

    // Xác định các trang liên quan đến thanh toán/giỏ hàng
    const hiddenRoutes = ['/cart', '/checkout', '/order-success', '/order/vnpay-return'];
    const isHiddenRoute = hiddenRoutes.some(route => location.pathname.includes(route));
    
    // Nếu đang mở giỏ hàng hoặc ở trang thanh toán -> Ẩn chatbot
    const isHidden = isCartOpen || isHiddenRoute;

    // Auto-open logic after 10 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!hasOpenedOnce) {
                setIsOpen(true);
                setHasOpenedOnce(true);
            }
        }, 10000); // 10 seconds

        return () => clearTimeout(timer);
    }, [hasOpenedOnce]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!hasOpenedOnce) setHasOpenedOnce(true);
    };

    return (
        <div 
            className={cn(
                "fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none transition-all duration-500",
                isHidden ? "opacity-0 scale-50 translate-y-10" : "opacity-100 scale-100 translate-y-0"
            )}
        >
            {/* Chat Window Container */}
            <div className={cn(
                "transition-all duration-300 transform origin-bottom-right pointer-events-auto",
                isOpen 
                    ? "scale-100 opacity-100 translate-y-0" 
                    : "scale-90 opacity-0 translate-y-10 pointer-events-none"
            )}>
                {isOpen && (
                    <Suspense fallback={
                        <div className="w-[320px] sm:w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl flex items-center justify-center border border-gray-100">
                             <div className="flex flex-col items-center gap-3">
                                <Bot className="animate-pulse text-zinc-300" size={40} />
                                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Kvil Assistant</span>
                             </div>
                        </div>
                    }>
                        <UserChatbotWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
                    </Suspense>
                )}
            </div>

            {/* Floating Toggle Button */}
            <Button
                onClick={toggleChat}
                className={cn(
                    "w-14 h-14 rounded-full shadow-2xl transition-all duration-500 pointer-events-auto",
                    "flex items-center justify-center border-none",
                    isOpen 
                        ? "bg-white text-black hover:bg-gray-50 rotate-90" 
                        : "bg-[#1c1c19] text-white hover:bg-zinc-800 scale-110"
                )}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
                
                {!hasOpenedOnce && !isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-bounce" />
                )}
            </Button>
        </div>
    );
};

export default UserChatbotWidget;
