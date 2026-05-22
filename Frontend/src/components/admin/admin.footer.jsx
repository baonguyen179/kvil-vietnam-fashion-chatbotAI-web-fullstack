import { Layout } from 'antd'
const { Footer } = Layout;
const AdminFooter = () => {
    return (
        <Footer style={{ 
            padding: '16px', 
            textAlign: 'center',
            background: '#fff',
            color: 'rgba(0, 0, 0, 0.45)',
            borderTop: '1px solid #f0f0f0',
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            Kvil Vietnam Fashion © {new Date().getFullYear()} Crafted with passion by Bao Nguyen
        </Footer>
    )
}
export default AdminFooter