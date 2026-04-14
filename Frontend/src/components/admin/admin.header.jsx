import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Layout } from 'antd';
import { useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';

const AdminHeader = (props) => {
    const { user, collapseMenu, setCollapseMenu } = props;
    const { Header } = Layout;

    const items = [
        {
            key: '1',
            label: <span>Settings</span>,
            icon: <SettingOutlined />
        },
        {
            key: '4',
            danger: true,
            label: <span>Đăng xuất</span>,
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
                            WELCOME{user?.name}
                            <DownOutlined />
                        </Space>
                    </a>
                </Dropdown>
            </Header>
        </>
    )
}

export default AdminHeader;