import { Outlet } from 'react-router-dom';
import { Layout, theme, ConfigProvider, App as AntdApp } from 'antd';

const { Header, Sider, Content } = Layout;

// Tách phần giao diện chính ra một component nhỏ để dùng được theme.useToken() an toàn bên trong ConfigProvider
const AdminLayoutContent = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout className="min-h-screen">
            {/* Sidebar bên trái */}
            <Sider width={250} theme="light" className="border-r border-gray-200">
                {/* <SidebarComponent /> */}
                <div className="p-4 font-bold text-lg">Admin Sidebar</div>
            </Sider>

            {/* Phần nội dung bên phải */}
            <Layout>
                <Header 
                    style={{ background: colorBgContainer }} 
                    className="px-4 border-b border-gray-200"
                >
                    {/* <AdminHeaderComponent /> */}
                    <div>Admin Header</div>
                </Header>

                <Content 
                    style={{
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                    className="m-6 p-6 overflow-initial"
                >
                    {/* Nội dung các route con của Admin sẽ render tại đây */}
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
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