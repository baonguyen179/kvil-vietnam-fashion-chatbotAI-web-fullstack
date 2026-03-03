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

module.exports = {
    handleRegister,
    handleLogin
}