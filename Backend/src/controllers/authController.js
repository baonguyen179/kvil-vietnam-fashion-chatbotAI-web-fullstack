require('dotenv').config()
const authService = require('../service/authService');
const errorCode = require('../config/errorCodes');

const isValidEmail = (email) => {
    return /^\S+@\S+\.\S+$/.test(email);
}
const isValidPhone = (phone) => {
    return /^\d{10,11}$/.test(phone); // Chỉ chứa số, độ dài từ 10-11 số
}

const handleRegister = async (req, res) => {
    try {
        const email = req.body.email?.trim();
        const phone = req.body.phone?.trim();
        const password = req.body.password;
        const fullName = req.body.fullName?.trim();

        if (!email || !password || !phone || !fullName) {
            return res.status(200).json({
                EM: "Missing required parameters!",
                EC: errorCode.VALIDATION_ERROR,
                DT: ""
            })
        }

        if (password.length < 6) {
            return res.status(200).json({
                EM: 'The password must be more than 6 letters.',
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            })
        }

        if (!isValidEmail(email)) {
            return res.status(200).json({
                EM: 'Invalid email format!',
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            })
        }

        if (!isValidPhone(phone)) {
            return res.status(200).json({
                EM: 'Invalid phone number format!',
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            })
        }

        const cleanData = { ...req.body, email, phone, fullName };
        const data = await authService.registerNewUser(cleanData);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        console.error(">>> Lỗi tại authController (Register):", error);
        return res.status(500).json({
            EM: 'Lỗi máy chủ nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}

const handleLogin = async (req, res) => {
    try {
        const loginValue = req.body.loginValue?.trim();
        const password = req.body.password;

        if (!loginValue || !password) {
            return res.status(200).json({
                EM: "Missing required parameters!",
                EC: errorCode.VALIDATION_ERROR,
                DT: ""
            })
        }

        if (password.length < 6) {
            return res.status(200).json({
                EM: 'The password must be more than 6 letters.',
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            })
        }

        const data = await authService.userLogin({ ...req.body, loginValue });

        if (data && data.DT && data.DT.refresh_token) {
            res.cookie("refresh_token", data.DT.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            delete data.DT.refresh_token;
        }

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        })
    } catch (e) {
        console.error('>>> Lỗi tại authController (Login): ', e)
        res.status(500).json({
            EM: "Error from server",
            EC: errorCode.OTHER_ERROR,
            DT: ''
        })
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

        return res.status(200).json({
            EM: 'Đăng xuất tài khoản thành công!',
            EC: errorCode.SUCCESS,
            DT: ''
        });

    } catch (e) {
        console.error('>>> Lỗi tại authController (Logout): ', e);
        return res.status(500).json({
            EM: "Lỗi server khi đăng xuất",
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
const handleRefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refresh_token;

        if (!refreshToken) {
            return res.status(200).json({
                EM: "Không tìm thấy Refresh Token ở Cookie. Vui lòng đăng nhập!",
                EC: errorCode.UNAUTHENTICATED,
                DT: ""
            });
        }

        const data = await authService.refreshUserToken(refreshToken);

        if (data && data.DT && data.DT.refresh_token) {
            res.cookie("refresh_token", data.DT.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
            });

            delete data.DT.refresh_token;
        }

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (e) {
        console.error('>>> Lỗi tại authController (Refresh): ', e);
        res.status(500).json({
            EM: "Lỗi server khi refresh token",
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
const handleChangePassword = async (req, res) => {
    try {
        const userId = req.user.id;

        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;

        if (!oldPassword || !newPassword) {
            return res.status(200).json({
                EM: "Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới!",
                EC: errorCode.VALIDATION_ERROR,
                DT: ""
            });
        }

        if (newPassword.length < 6) {
            return res.status(200).json({
                EM: "Mật khẩu mới phải có ít nhất 6 ký tự!",
                EC: errorCode.VALIDATION_ERROR,
                DT: ""
            });
        }

        if (oldPassword === newPassword) {
            return res.status(200).json({
                EM: "Mật khẩu mới không được trùng với mật khẩu cũ!",
                EC: errorCode.VALIDATION_ERROR,
                DT: ""
            });
        }

        const data = await authService.changePassword(userId, oldPassword, newPassword);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (e) {
        console.error('>>> Lỗi tại authController (Change Password): ', e);
        return res.status(500).json({
            EM: "Lỗi server khi đổi mật khẩu",
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
module.exports = {
    handleRegister,
    handleLogin,
    handleLogout,
    handleRefreshToken,
    handleChangePassword
}