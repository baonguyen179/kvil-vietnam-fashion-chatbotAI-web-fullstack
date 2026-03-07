require('dotenv').config();
const authService = require('../service/authService');
const errorCode = require('../config/errorCodes');
const authValidation = require('../validations/authValidation');
const handleRegister = async (req, res) => {
    try {
        const { error, value } = authValidation.registerSchema.validate(req.body);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: "" });
        }

        // value đã được Joi tự động trim() sạch sẽ và đúng chuẩn
        const data = await authService.registerNewUser(value);

        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi tại authController (Register):", error);
        return res.status(500).json({ EM: 'Lỗi máy chủ nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleLogin = async (req, res) => {
    try {
        const { error, value } = authValidation.loginSchema.validate(req.body);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: "" });
        }

        const data = await authService.userLogin(value);

        if (data && data.DT && data.DT.refresh_token) {
            res.cookie("refresh_token", data.DT.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            delete data.DT.refresh_token;
        }

        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (e) {
        console.error('>>> Lỗi tại authController (Login): ', e);
        res.status(500).json({ EM: "Error from server", EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleLogout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        if (refreshToken) {
            await authService.logoutUser(refreshToken);
        }
        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        return res.status(200).json({ EM: 'Đăng xuất tài khoản thành công!', EC: errorCode.SUCCESS, DT: '' });
    } catch (e) {
        console.error('>>> Lỗi tại authController (Logout): ', e);
        return res.status(500).json({ EM: "Lỗi server khi đăng xuất", EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleRefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;
        if (!refreshToken) {
            return res.status(200).json({ EM: "Không tìm thấy Refresh Token ở Cookie. Vui lòng đăng nhập!", EC: errorCode.UNAUTHENTICATED, DT: "" });
        }
        const data = await authService.refreshUserToken(refreshToken);
        if (data && data.DT && data.DT.refresh_token) {
            res.cookie("refresh_token", data.DT.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            delete data.DT.refresh_token;
        }
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (e) {
        console.error('>>> Lỗi tại authController (Refresh): ', e);
        res.status(500).json({ EM: "Lỗi server khi refresh token", EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleChangePassword = async (req, res) => {
    try {
        const userId = req.user.id;

        const { error, value } = authValidation.changePasswordSchema.validate(req.body);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: "" });
        }

        const data = await authService.changePassword(userId, value.oldPassword, value.newPassword);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (e) {
        console.error('>>> Lỗi tại authController (Change Password): ', e);
        return res.status(500).json({ EM: "Lỗi server khi đổi mật khẩu", EC: errorCode.OTHER_ERROR, DT: '' });
    }
}

module.exports = {
    handleRegister,
    handleLogin,
    handleLogout,
    handleRefreshToken,
    handleChangePassword
}