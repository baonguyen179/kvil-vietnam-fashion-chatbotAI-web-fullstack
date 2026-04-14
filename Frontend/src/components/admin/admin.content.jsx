
import { Layout, theme } from 'antd';
const { Content } = Layout;


const AdminContent = ({ children }) => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    return (
        <Content style={{ margin: '24px 16px 0' }}>
            <div
                style={{
                    padding: 24,
                    minHeight: 360,
                    background: colorBgContainer,
                    borderRadius: borderRadiusLG,
                }}
            >
                {children}
            </div>
        </Content>
    )
}
export default AdminContent