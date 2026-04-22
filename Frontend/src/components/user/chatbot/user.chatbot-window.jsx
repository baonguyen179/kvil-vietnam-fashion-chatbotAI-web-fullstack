import React, { useState, useEffect } from 'react';
import { Bot, RotateCcw, AlertTriangle } from 'lucide-react';
import chatbotService from '@/services/chatbotService';
import UserChatbotBody from './user.chatbot-body';
import UserChatbotInput from './user.chatbot-input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

/**
 * [SENIOR COMPONENT] UserChatbotWindow
 * Main chat container synced with user naming conventions.
 */
const UserChatbotWindow = ({ onClose }) => {
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setIsFetchingHistory(true);
            setError(null);
            const res = await chatbotService.getHistory(1, 40);
            if (res && res.EC === 0) {
                const history = res.DT.logs || [];
                setMessages(history);

                if (history.length === 0) {
                    setMessages([{
                        id: 'welcome',
                        sender: 'BOT',
                        message: "Chào bạn! Mình là Kvil Assistant. Mình có thể giúp gì cho bạn trong việc chọn đồ hôm nay? 😊",
                        createdAt: new Date().toISOString()
                    }]);
                }
            }
        } catch (err) {
            console.error("History fetch error:", err);
            setError("ERR_LOAD");
        } finally {
            setIsFetchingHistory(false);
        }
    };

    const handleSendMessage = async (text) => {
        if (!text.trim() || isLoading) return;

        const userMsg = {
            id: Date.now(),
            sender: 'USER',
            message: text,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const res = await chatbotService.sendMessage(text);
            if (res && res.EC === 0) {
                const botMsg = {
                    id: Date.now() + 1,
                    sender: 'BOT',
                    message: res.DT.reply,
                    metadata: res.DT.suggestedProducts || [],
                    createdAt: new Date().toISOString()
                };
                setMessages(prev => [...prev, botMsg]);
            } else {
                toast.error(res.EM || "Có lỗi khi gửi tin nhắn.");
            }
        } catch (err) {
            toast.error("Vấn đề kết nối. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-[320px] sm:w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-[#1c1c19] p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                        <Bot size={20} className="text-zinc-200" />
                    </div>
                    <div>
                        <h3 className="text-white text-sm font-bold tracking-tight" style={{ fontFamily: "'Lora', serif" }}>
                            Kvil Assistant
                        </h3>
                        <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">Trực tuyến</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={fetchHistory}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Tải lại lịch sử"
                >
                    <RotateCcw size={16} className="text-zinc-400" />
                </button>
            </div>

            {/* Error View */}
            {error === "ERR_LOAD" ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <AlertTriangle size={40} className="text-amber-500 opacity-20" />
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-loose">
                        Dạ, kết nối bị gián đoạn.<br/>Vui lòng thử lại.
                    </p>
                    <Button 
                        variant="outline" 
                        className="rounded-none border-gray-200 text-[10px] uppercase font-bold tracking-widest h-10 px-8"
                        onClick={fetchHistory}
                    >
                        Tải lại
                    </Button>
                </div>
            ) : (
                <>
                    <UserChatbotBody 
                        messages={messages} 
                        isTyping={isLoading} 
                        isFetching={isFetchingHistory} 
                    />
                    <UserChatbotInput onSend={handleSendMessage} disabled={isLoading} />
                </>
            )}

            <div className="py-2 text-center bg-gray-50 border-t border-gray-100 shrink-0">
                <span className="text-[9px] uppercase tracking-widest text-zinc-300 font-bold">Powered by Kvil AI</span>
            </div>
        </div>
    );
};

export default UserChatbotWindow;
