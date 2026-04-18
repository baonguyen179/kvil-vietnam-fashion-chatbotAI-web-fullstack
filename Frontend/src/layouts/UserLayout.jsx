import UserHeader from '@/components/user/user.header';
import UserContent from '@/components/user/user.content';
import UserFooter from '@/components/user/user.footer';
import { Outlet } from 'react-router-dom';

const UserLayout = () => {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <UserHeader />

            <UserContent className="pt-[136px]">
                <Outlet />
            </UserContent>

            <UserFooter />
        </div>
    );
};

export default UserLayout;