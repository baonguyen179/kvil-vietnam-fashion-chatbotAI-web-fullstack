import UserHeader from '@/components/user/user.header';
import UserContent from '@/components/user/user.content';
import UserFooter from '@/components/user/user.footer';
import UserChatbotWidget from '@/components/user/chatbot/user.chatbot-widget';
import { Outlet } from 'react-router-dom';

const UserLayout = () => {
    return (
        <div className="flex min-h-screen flex-col bg-background relative">
            <UserHeader />

            <UserContent className="pt-[136px]">
                <Outlet />
            </UserContent>

            <UserFooter />
            
            {/* AI Chatbot Assistant (Fixed Position) */}
            <UserChatbotWidget />
        </div>
    );
};


export default UserLayout;