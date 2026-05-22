import { useSelector } from "react-redux";
import { useLocation, Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, user } = useSelector(state => state.auth); 
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !user?.roles?.some(role => allowedRoles.includes(role))) {
        return <Navigate to="/" replace />; 
    }

    return <>{children}</>;
};

export default PrivateRoute;