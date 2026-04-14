import { Layout } from 'antd'
const { Footer } = Layout;
const AdminFooter = () => {
    return (
        <>
            <Footer style={{ textAlign: 'center' }}>
                Bao Nguyen ©{new Date().getFullYear()} Created by Bao Nguyen
            </Footer>
        </>
    )
}
export default AdminFooter