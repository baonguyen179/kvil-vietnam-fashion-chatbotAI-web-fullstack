import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Layout, Dropdown, Space, Avatar } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { performLogout } from '@/redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { DownOutlined } from '@ant-design/icons';
const AdminHeader = (props) => {
    const { collapseMenu, setCollapseMenu } = props;
    const { Header } = Layout;
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Nhận dữ liệu user trực tiếp từ Redux store
    const user = useSelector(state => state.auth.user);

    const handleLogout = async () => {
        await dispatch(performLogout());
        navigate('/login');
    };

    const items = [
        {
            key: 'home',
            label: <span onClick={() => navigate('/')}>Trang chủ</span>,
            icon: <UserOutlined />
        },
        {
            key: '1',
            label: <span>Settings</span>,
            icon: <SettingOutlined />
        },
        {
            key: '4',
            danger: true,
            label: <span onClick={handleLogout}>Đăng xuất</span>,
            icon: <LogoutOutlined />,
        },
    ];

    return (
        <>
            <Header
                style={{
                    padding: 0,
                    display: "flex",
                    background: "#f5f5f5",
                    justifyContent: "space-between",
                    alignItems: "center"
                }} >

                <Button
                    type="text"
                    icon={collapseMenu ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapseMenu(!collapseMenu)}
                    style={{
                        fontSize: '16px',
                        width: 64,
                        height: 64,
                    }}
                />
                <Dropdown menu={{ items }} >
                    <a onClick={(e) => e.preventDefault()}
                        style={{ color: "unset", lineHeight: "0 !important", marginRight: 20 }}
                    >
                        <Space>
                            <Avatar icon={<UserOutlined />} src={user?.avatar} />
                            <span style={{ fontWeight: 500 }}>
                                {user?.fullName || user?.email || 'Admin User'}
                            </span>
                            <span style={{ fontSize: 12, color: 'gray', marginLeft: 4 }}>
                                ({user?.role || 'Guest'})
                            </span>
                            <DownOutlined />
                        </Space>
                    </a>
                </Dropdown>
            </Header>
        </>
    )
}

export default AdminHeader;