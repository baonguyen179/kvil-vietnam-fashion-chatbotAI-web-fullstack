const jwt = require('jsonwebtoken');
require('dotenv').config()
const errorCode = require('../config/errorCodes');

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

const checkUserPermission = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            EC: errorCode.UNAUTHENTICATED,
            EM: 'Not authenticated the user',
            DT: ''
        });
    }

    const userRole = req.user.role;
    const currentPath = req.baseUrl + req.path;

    const isAdminRoute = /\/api\/v\d+\/admin(\/|$)/.test(currentPath);
    if (isAdminRoute) {
        if (userRole === 'ADMIN') {
            return next();
        } else {
            return res.status(403).json({
                EC: errorCode.UNAUTHORIZED,
                EM: `You don't have permission to access this Admin resource`,
                DT: ''
            });
        }
    }
    next();
}

module.exports = {
    createAccessJWT,
    verifyAccessToken,
    checkUserJWT,
    checkUserPermission,
    createRefreshJWT,
    verifyRefreshToken
}