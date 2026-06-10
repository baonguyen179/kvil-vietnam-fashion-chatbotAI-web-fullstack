import React from "react";
import Layout from "antd/es/layout";
import Menu from "antd/es/menu";
import { 
    AppstoreOutlined, 
    TeamOutlined, 
    ShoppingOutlined, 
    ShoppingCartOutlined, 
    TagOutlined,
    RobotOutlined,
    InboxOutlined,
    TransactionOutlined,
    SafetyCertificateOutlined,
    StarOutlined,
    BarChartOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminSideBar = React.memo(({collapseMenu, setCollapseMenu}) => {
    const { Sider } = Layout;

    const user = useSelector(state => state.auth.user);
    const { roles = [], permissions = [] } = user || {};
    const isSuperAdmin = roles.includes('SUPER_ADMIN');

    // Sử dụng useMemo để tối ưu hiệu suất, chỉ tính toán lại menu khi quyền hạn thay đổi
    const items = React.useMemo(() => {
        // Định nghĩa các menu items và quyền truy cập tương ứng
        const allItems = [
            {
                key: "dashboard",
                label: <Link to={"/admin"}>Tổng quan</Link>,
                icon: <AppstoreOutlined />,
                permission: 'dashboard.read'
            },
            {
                key: "reports",
                label: <Link to={"/admin/reports"}>Báo cáo kinh doanh</Link>,
                icon: <BarChartOutlined />,
                allowedRoles: ['SUPER_ADMIN', 'SALES', 'ACCOUNTANT']
            },
            {
                key: "users",
                label: <Link to={"/admin/users"}>Quản lý người dùng</Link>,
                icon: <TeamOutlined />,
                permission: 'users.manage'
            },
            {
                key: "roles",
                label: <Link to={"/admin/roles"}>Phân quyền</Link>,
                icon: <SafetyCertificateOutlined />,
                permission: 'roles.manage' 
            },
            {
                key: 'catalog',
                label: 'Quản lý sản phẩm',
                icon: <ShoppingOutlined />,
                permission: 'products.read',
                children: [
                    {
                        key: 'categories',
                        label: <Link to={"/admin/categories"}>Danh mục</Link>,
                    },
                    {
                        key: 'products',
                        label: <Link to={"/admin/products"}>Sản phẩm</Link>,
                    },
                    {
                        key: 'collections',
                        label: <Link to={"/admin/collections"}>Bộ sưu tập</Link>,
                    },
                    {
                        key: 'attributes',
                        label: <Link to={"/admin/attributes"}>Thuộc tính</Link>,
                    },
                ],
            },
            {
                key: 'inventory',
                label: <Link to={"/admin/inventory"}>Quản lý kho</Link>,
                icon: <InboxOutlined />,
                permission: 'inventory.read'
            },
            {
                key: 'orders_parent',
                label: 'Đơn hàng',
                icon: <ShoppingCartOutlined />,
                permission: 'orders.read',
                children: [
                    {
                        key: "orders",
                        label: <Link to={"/admin/orders"}>Danh sách đơn</Link>,
                    },
                    {
                        key: "return_requests",
                        label: <Link to={"/admin/orders/returns"}>Yêu cầu trả hàng</Link>,
                    },
                    {
                        key: "reviews",
                        label: <Link to={"/admin/reviews"}>Đánh giá</Link>,
                        icon: <StarOutlined />,
                    },
                ],
            },

            {
                key: "coupons",
                label: <Link to={"/admin/coupons"}>Mã giảm giá</Link>,
                icon: <TagOutlined />,
                permission: 'coupons.manage'
            },
            {
                key: "transactions",
                label: <Link to={"/admin/transactions"}>Giao dịch</Link>,
                icon: <TransactionOutlined />,
                permission: 'payments.read'
            },
            {
                key: "chatbot",
                label: <Link to={"/admin/chatbot"}>Chatbot AI</Link>,
                icon: <RobotOutlined />,
                permission: 'chatbot.read'
            },
        ];

        // Lọc menu theo quyền hạn hoặc vai trò Super Admin
        const filtered = allItems
            .filter(item => {
                if (isSuperAdmin) return true;
                if (item.allowedRoles && roles.some(r => item.allowedRoles.includes(r))) return true;
                if (item.permission && permissions.includes(item.permission)) return true;
                return false;
            })
            .map(item => {
                const { allowedRoles, permission, ...rest } = item;
                return rest;
            });

        return [
            {
                key: 'grp',
                type: 'group',
                children: filtered
            }
        ];
    }, [isSuperAdmin, permissions, roles]);

    return (
        <Sider
            collapsed={collapseMenu}
            theme="light"
            style={{
                height: '100vh',
                borderRight: '1px solid #f0f0f0'
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
                color: '#000',
                fontSize: collapseMenu ? '18px' : '20px',
                fontWeight: 'bold',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                borderBottom: '1px solid #f0f0f0'
            }}>
                {collapseMenu ? 'K' : 'KVIL ADMIN'}
            </div>

            <Menu
                mode="inline"
                theme="light"
                defaultSelectedKeys={['dashboard']}
                items={items}
                style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', borderRight: 0 }}
            />

            <div style={{
                padding: '16px',
                textAlign: 'center',
                color: 'rgba(0, 0, 0, 0.45)',
                borderTop: '1px solid #f0f0f0',
                fontSize: '12px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                background: '#fff'
            }}>
                {collapseMenu ? 'v1' : 'Kvil Store v1.0'}
            </div>
            </div>
        </Sider>
    )
});

export default AdminSideBar;