import React, { useEffect, useRef } from 'react';
import UserChatbotMessage from './user.chatbot-message';
import { Loader2 } from 'lucide-react';

/**
 * [SENIOR COMPONENT] UserChatbotBody
 * Renders the scrollable list of messages and handles auto-scrolling.
 */
const UserChatbotBody = ({ messages, isTyping, isFetching, onLoadMore, hasMore }) => {
    const scrollRef = useRef(null);
    const prevScrollHeightRef = useRef(0);
    const prevMessagesLengthRef = useRef(0);
    const prevLastMessageIdRef = useRef(null);

    // Handle scroll position conservation and auto-scrolling
    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const currentLength = messages.length;
        const prevLength = prevMessagesLengthRef.current;

        // If it's the initial load, scroll to bottom
        if (prevLength === 0 && currentLength > 0) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        } else if (currentLength > prevLength) {
            const lastMsg = messages[currentLength - 1];
            const prevLastMsgId = prevLastMessageIdRef.current;

            // If a new message was appended to the bottom (last message ID changed)
            if (lastMsg && lastMsg.id !== prevLastMsgId) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            } else {
                // Older messages were prepended to the top
                const newScrollHeight = scrollContainer.scrollHeight;
                const heightDiff = newScrollHeight - prevScrollHeightRef.current;
                scrollContainer.scrollTop = heightDiff;
            }
        } else if (isTyping) {
            // Scroll to bottom when bot is typing
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }

        // Save current measurements for the next update
        prevScrollHeightRef.current = scrollContainer.scrollHeight;
        prevMessagesLengthRef.current = currentLength;
        prevLastMessageIdRef.current = messages[currentLength - 1]?.id || null;
    }, [messages, isTyping]);

    // Handle scroll event to trigger loading older messages
    const handleScroll = () => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        // Save scrollHeight dynamically on scroll so we have the absolute latest before any re-render
        prevScrollHeightRef.current = scrollContainer.scrollHeight;

        // Scroll top threshold (5px) for triggering pagination
        if (scrollContainer.scrollTop <= 5 && !isFetching && hasMore && onLoadMore) {
            onLoadMore();
        }
    };

    return (
        <div 
            ref={scrollRef}
            onScroll={handleScroll}
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
                    {/* Older history loading indicator at the top */}
                    {isFetching && messages.length > 0 && (
                        <div className="flex justify-center py-2 animate-in fade-in duration-200">
                            <Loader2 size={18} className="animate-spin text-zinc-400" />
                        </div>
                    )}

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
