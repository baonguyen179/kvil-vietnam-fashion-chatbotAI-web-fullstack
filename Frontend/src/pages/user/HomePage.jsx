import { useSelector, useDispatch } from 'react-redux';
import { logout } from "@/redux/slices/authSlice";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
const HomePage = () => {
    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    return (
        <div>
            <h1>HomePage</h1>
            <p>Nội dung trang chủ</p>
            {isAuthenticated &&
                <Button onClick={() => dispatch(logout())}>Logout</Button>}
            {!isAuthenticated &&
                <Button onClick={() => navigate("/login")}>Login</Button>}
        </div>
    );
};

export default HomePage;