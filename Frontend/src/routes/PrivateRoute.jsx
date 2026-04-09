
import { useSelector } from "react-redux";
import { useLocation, Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const isAuthenticated = useSelector(state => state.user.isAuthenticated);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
export default PrivateRoute