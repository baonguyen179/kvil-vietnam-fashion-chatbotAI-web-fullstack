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
        label: 'Kvil Admin',
        type: 'group',
        children: [
            {
                key: "dashboard",
                label: <Link href={"/admin"}>Dashboard</Link>,
                icon: <AppstoreOutlined />,
            },
            {
                key: "users",
                label: <Link href={"/admin"}>Manage Users</Link>,
                icon: <TeamOutlined />,
            },
            {
                key: 'catalog',
                label: 'Catalog', // Gom Categories, Products, Collections vào đây
                icon: <ShoppingOutlined />,
                children: [
                    {
                        key: 'categories',
                        label: <Link href={"/admin"}>Categories</Link>,
                    },
                    {
                        key: 'products',
                        label: <Link href={"/admin"}>Products</Link>,
                    },
                    {
                        key: 'collections',
                        label: <Link href={"/admin"}>Collections</Link>,
                    },
                ],
            },
            {
                key: "orders",
                label: <Link href={"/admin"}>Orders</Link>,
                icon: <ShoppingCartOutlined />,
            },
            {
                key: "coupons",
                label: <Link href={"/admin"}>Coupons</Link>,
                icon: <TagOutlined />,
            },
        ],
    },
];

    return (
        <Sider
            collapsed={collapseMenu}
        >

            <Menu
                mode="inline"
                defaultSelectedKeys={['dashboard']}
                items={items}
                style={{ height: '100vh' }}
            />
        </Sider>
    )
}

export default AdminSideBar;