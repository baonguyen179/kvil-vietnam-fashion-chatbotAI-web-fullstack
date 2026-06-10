const jwt = require('jsonwebtoken');
require('dotenv').config()
const errorCode = require('../config/errorCodes');
const { ADMIN_ROLES } = require('../config/roles');

// Tối ưu hóa Regex: Khởi tạo một lần bên ngoài các hàm middleware để tái sử dụng, tăng hiệu suất.
const ADMIN_ROUTE_REGEX = /\/api\/v\d+\/admin(\/|$)/;

const createAccessJWT = (payload) => {
    let key = process.env.JWT_SECRET;
    let token = null;

    try {
        token = jwt.sign(payload, key, { expiresIn: process.env.JWT_EXPIRESIN });
    } catch (error) {
        console.log(">>> Create JWT Error: ", error.message);
    }
    return token
}

const createRefreshJWT = (payload) => {
    let key = process.env.JWT_REFRESH_SECRET;
    let token = null;

    try {
        token = jwt.sign(payload, key, { expiresIn: process.env.JWT_REFRESH_EXPIRESIN });
    } catch (error) {
        console.log(">>> Create Refresh JWT Error: ", error.message);
    }
    return token;
}

const verifyAccessToken = (token) => {
    let key = process.env.JWT_SECRET;
    try {
        return jwt.verify(token, key);
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            return "EXPIRED";
        }
        console.log("Verify JWT Error:", e.message);
        return null;
    }
}

const verifyRefreshToken = (token) => {
    let key = process.env.JWT_REFRESH_SECRET;
    let data = null;
    try {
        data = jwt.verify(token, key);
    } catch (e) {
        console.log("Verify Refresh JWT Error:", e.message);
    }
    return data;
}

const extractToken = (req) => {
    if (req.headers.authorization?.startsWith('Bearer ')) {
        return req.headers.authorization.split(' ')[1];
    }
    return null
}

const checkUserJWT = (req, res, next) => {
    let token = extractToken(req);

    if (!token) {
        return res.status(401).json({ EC: errorCode.UNAUTHENTICATED, EM: 'Not authenticated the user', DT: '' });
    }

    let decoded = verifyAccessToken(token);

    if (decoded === "EXPIRED") {
        return res.status(401).json({
            EC: errorCode.TOKEN_EXPIRED,
            EM: 'Access Token is expired',
            DT: ''
        });
    }

    if (decoded) {
        req.user = decoded;
        req.token = token;
        return next();
    }

    return res.status(401).json({
        EC: errorCode.UNAUTHENTICATED,
        EM: 'Access Token is invalid',
        DT: ''
    });
}

const checkUserPermission = (...args) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                EC: errorCode.UNAUTHENTICATED,
                EM: 'Not authenticated the user',
                DT: ''
            });
        }

        const userRoles = req.user.roles || [req.user.role];
        
        // [SUPER ADMIN BYPASS] Super Admin luôn có tất cả quyền
        if (userRoles.includes('SUPER_ADMIN')) {
            return next();
        }

        let allowedRoles = [];
        let requiredPermissions = [];

        // Hỗ trợ cả 2 cách truyền tham số:
        // checkUserPermission('ADMIN', 'SALES') -> args là ['ADMIN', 'SALES']
        // checkUserPermission(['ADMIN'], ['products.read']) -> args[0] là mảng
        if (Array.isArray(args[0])) {
            allowedRoles = args[0] || [];
            requiredPermissions = args[1] || [];
        } else {
            allowedRoles = args;
        }

        const userPermissions = req.user.permissions || [];
        const currentPath = req.baseUrl + req.path;

        // 1. Kiểm tra theo Quyền hạn (Permissions) - Nếu có yêu cầu cụ thể
        if (requiredPermissions.length > 0) {
            const hasPermission = requiredPermissions.every(p => userPermissions.includes(p));
            if (hasPermission) return next();
            
            return res.status(403).json({
                EC: errorCode.UNAUTHORIZED,
                EM: `Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: ${requiredPermissions.join(', ')}`,
                DT: ''
            });
        }

        // 2. Kiểm tra theo Vai trò (Roles)
        if (allowedRoles.length > 0) {
            const hasRole = allowedRoles.some(role => userRoles.includes(role));
            if (hasRole) {
                return next();
            } else {
                return res.status(403).json({
                    EC: errorCode.UNAUTHORIZED,
                    EM: `Bạn không có vai trò phù hợp. Yêu cầu: ${allowedRoles.join(' hoặc ')}`,
                    DT: ''
                });
            }
        }

        // 3. Mặc định: Kiểm tra quyền Admin chung dựa trên Route
        const isAdminRoute = ADMIN_ROUTE_REGEX.test(currentPath);
        if (isAdminRoute) {
            const hasAdminRole = userRoles.some(role => ADMIN_ROLES.includes(role));
            if (hasAdminRole) {
                return next();
            } else {
                return res.status(403).json({
                    EC: errorCode.UNAUTHORIZED,
                    EM: `Bạn không có quyền truy cập vào tài nguyên Quản trị này.`,
                    DT: ''
                });
            }
        }
        next();
    };
}

const optionalAuth = (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        return next();
    }

    const decoded = verifyAccessToken(token);

    if (decoded === "EXPIRED") {
        return res.status(401).json({
            EC: errorCode.TOKEN_EXPIRED,
            EM: 'Access Token is expired',
            DT: ''
        });
    }

    if (decoded) {
        req.user = decoded;
        req.token = token;
        return next();
    }

    return res.status(401).json({
        EC: errorCode.UNAUTHENTICATED,
        EM: 'Access Token is invalid',
        DT: ''
    });
};



module.exports = {
    createAccessJWT,
    verifyAccessToken,
    checkUserJWT,
    checkUserPermission,
    createRefreshJWT,
    verifyRefreshToken,
    optionalAuth
}