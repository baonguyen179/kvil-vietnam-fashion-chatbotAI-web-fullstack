import React from 'react';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { encodeId } from '@/utils/idHasher';
import { slugify } from '@/utils/slugify';

/**
 * [SENIOR COMPONENT] UserChatbotMessage
 * Renders individual chat bubbles. Supports suggested products list.
 */
const UserChatbotMessage = ({ message }) => {
    const isBot = message.sender === 'BOT';
    
    // Parse product metadata if it's a bot message
    const products = message.metadata || []; 

    return (
        <div className={cn(
            "flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300",
            isBot ? "flex-row" : "flex-row-reverse"
        )}>
            {/* Avatar */}
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                isBot ? "bg-zinc-100 text-zinc-600" : "bg-[#1c1c19] text-white"
            )}>
                {isBot ? <Bot size={16} /> : <User size={16} />}
            </div>

            {/* Bubble Container */}
            <div className={cn(
                "flex flex-col max-w-[80%] gap-2",
                !isBot && "items-end"
            )}>
                <div className={cn(
                    "px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                    isBot 
                        ? "bg-white border border-gray-100 rounded-2xl rounded-tl-none text-[#1c1c19]" 
                        : "bg-[#1c1c19] text-white rounded-2xl rounded-tr-none font-medium"
                )}>
                    {message.message}
                </div>

                {/* Suggested Products (If any) */}
                {isBot && products && products.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 snap-x">
                        {products.map((product, idx) => (
                            <ProductCardMini key={product.id || idx} product={product} />
                        ))}
                    </div>
                )}

                <span className="text-[9px] text-gray-300 uppercase tracking-widest font-bold px-1">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};

/**
 * Mini Product Card for chat suggestions
 */
const ProductCardMini = ({ product }) => {
    const isObject = typeof product === 'object' && product !== null;
    const productId = isObject ? product.id : product;
    const productName = isObject ? product.name : `Sản phẩm #${productId}`;
    const productImage = isObject && product.images && product.images.length > 0 
        ? (product.images[0].imageUrl || product.images[0]) 
        : null;

    return (
        <Link 
            to={`/products/${encodeId(productId)}/${slugify(productName)}`}
            className="flex-none w-28 bg-white border border-gray-100 p-2 rounded-xl hover:border-black transition-all snap-start group"
            title={productName}
        >
            <div className="aspect-square bg-gray-50 rounded-lg mb-2 overflow-hidden flex items-center justify-center relative">
                {productImage ? (
                    <img src={productImage} alt={productName} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                ) : (
                    <span className="text-[10px] text-gray-300 font-bold group-hover:scale-110 transition-transform">#SP-{productId}</span>
                )}
            </div>
            <p className="text-[10px] font-bold truncate uppercase text-zinc-400 group-hover:text-black">{productName}</p>
        </Link>
    );
};

export default UserChatbotMessage;
