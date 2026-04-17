import { Outlet } from 'react-router-dom';
import { theme, ConfigProvider, App as AntdApp } from 'antd';
import AdminHeader from '../components/admin/admin.header';
import AdminSidebar from '../components/admin/admin.sidebar';
import AdminContent from '../components/admin/admin.content';
import AdminFooter from '../components/admin/admin.footer'; 
import { useState } from 'react';

// Tách phần giao diện chính ra một component nhỏ để dùng được theme.useToken() an toàn bên trong ConfigProvider
const AdminLayoutContent = () => {
    const [collapseMenu, setCollapseMenu] = useState(false);
    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
                <div className='left-side' style={{ minWidth: 80, height: "100vh", overflow: "hidden" }}>
                    <AdminSidebar collapseMenu={collapseMenu} setCollapseMenu={setCollapseMenu} />
                </div>
                <div className='right-side' style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
                    <AdminHeader user={{name: "admin", role: "admin"}} collapseMenu={collapseMenu} setCollapseMenu={setCollapseMenu} />
                    <AdminContent>
                        <Outlet />
                    </AdminContent>
                    <AdminFooter />
                </div>
        </div>
    );
};

const AdminLayout = () => {
    return (
        // ConfigProvider giúp thiết lập lại môi trường chuẩn cho toàn bộ component Ant Design bên trong
        // Đồng thời cô lập cấu hình theme cho riêng khu vực Admin
        <ConfigProvider
            theme={{
                token: {
                    // Bạn có thể ghi đè màu sắc của antd tại đây để không đụng tới Tailwind
                    // colorPrimary: '#1677ff', 
                },
            }}
        >
            {/* App của antd giúp reset các style global cho message, notification, modal của antd */}
            <AntdApp>
                <AdminLayoutContent />
            </AntdApp>
        </ConfigProvider>
    );
};

export default AdminLayout;