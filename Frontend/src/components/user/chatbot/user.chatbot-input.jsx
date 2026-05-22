import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * [SENIOR COMPONENT] UserChatbotInput
 * Precision input for chatbot messages.
 * Features: Auto-expanding textarea, Enter to send, Loading states.
 */
const UserChatbotInput = ({ onSend, disabled }) => {
    const [text, setText] = useState('');
    const textareaRef = useRef(null);

    // Auto-resize textarea logic
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [text]);

    const handleSend = () => {
        if (!text.trim() || disabled) return;
        onSend(text.trim());
        setText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="p-4 bg-white border-t border-gray-100 flex items-end gap-2 shrink-0">
            <div className="flex-1 min-h-[44px] bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2 focus-within:border-black transition-colors flex items-center">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    placeholder={disabled ? "Đang xử lý..." : "Nhập câu hỏi của bạn..."}
                    className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none py-1.5 scrollbar-hide"
                />
            </div>
            
            <Button
                onClick={handleSend}
                disabled={!text.trim() || disabled}
                className="w-11 h-11 rounded-full bg-[#1c1c19] text-white hover:bg-zinc-800 transition-all flex items-center justify-center p-0 shrink-0 shadow-lg shadow-zinc-100"
            >
                {disabled ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <Send size={18} className={text.trim() ? "translate-x-0.5 -translate-y-0.5" : ""} />
                )}
            </Button>
        </div>
    );
};

export default UserChatbotInput;
