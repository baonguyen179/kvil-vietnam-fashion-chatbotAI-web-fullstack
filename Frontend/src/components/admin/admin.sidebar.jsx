import Layout from "antd/es/layout";
import Menu from "antd/es/menu";
import { 
    AppstoreOutlined, 
    TeamOutlined, 
    ShoppingOutlined, 
    ShoppingCartOutlined, 
    TagOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const AdminSideBar = ({collapseMenu, setCollapseMenu}) => {
    const { Sider } = Layout;

const items = [
    {
        key: 'grp',
        type: 'group',
        children: [
            {
                key: "dashboard",
                label: <Link to={"/admin"}>Dashboard</Link>,
                icon: <AppstoreOutlined />,
            },
            {
                key: "users",
                label: <Link to={"/admin/users"}>Manage Users</Link>,
                icon: <TeamOutlined />,
            },
            {
                key: 'catalog',
                label: 'Catalog', // Gom Categories, Products, Collections vào đây
                icon: <ShoppingOutlined />,
                children: [
                    {
                        key: 'categories',
                        label: <Link to={"/admin/categories"}>Categories</Link>,
                    },
                    {
                        key: 'products',
                        label: <Link to={"/admin/products"}>Products</Link>,
                    },
                    {
                        key: 'collections',
                        label: <Link to={"/admin/collections"}>Collections</Link>,
                    },
                ],
            },
            {
                key: "orders",
                label: <Link to={"/admin/orders"}>Orders</Link>,
                icon: <ShoppingCartOutlined />,
            },
            {
                key: "coupons",
                label: <Link to={"/admin"}>Coupons</Link>,
                icon: <TagOutlined />,
            },
        ],
    },
];

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
}

export default AdminSideBar;