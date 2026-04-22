import React, { useEffect, useRef } from 'react';
import UserChatbotMessage from './user.chatbot-message';
import { Loader2 } from 'lucide-react';

/**
 * [SENIOR COMPONENT] UserChatbotBody
 * Renders the scrollable list of messages and handles auto-scrolling.
 */
const UserChatbotBody = ({ messages, isTyping, isFetching }) => {
    const scrollRef = useRef(null);

    // Auto-scroll to bottom whenever messages or typing state changes
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {isFetching && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                    <Loader2 size={24} className="animate-spin text-zinc-200" />
                    <span className="text-[10px] text-zinc-300 uppercase font-bold tracking-widest outline-none">Đang lấy lịch sử...</span>
                </div>
            ) : (
                <>
                    {messages.map((msg, index) => (
                        <UserChatbotMessage 
                            key={msg.id || index} 
                            message={msg} 
                        />
                    ))}

                    {isTyping && (
                        <div className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                             <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                                <span className="flex gap-1">
                                    <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce"></span>
                                </span>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UserChatbotBody;
