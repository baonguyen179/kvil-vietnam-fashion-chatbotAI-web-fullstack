require('dotenv').config();
const db = require('../models/index');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const errorCode = require('../config/errorCodes');
const rbacService = require('./rbacService');
const { createAccessJWT, createRefreshJWT, verifyRefreshToken } = require('../middleware/JWTAction');
const redisHelper = require('../helpers/redis.helper');
const { ROLES } = require('../config/roles');

const salt = bcrypt.genSaltSync(10);
const hashUserPassword = async (userPassword) => {
    return await bcrypt.hash(userPassword, salt);
}
const checkPassword = async (inputPassword, hashPasswordInDB) => {
    const isMatch = await bcrypt.compare(inputPassword, hashPasswordInDB);
    return isMatch; // Trả về true nếu đúng, false nếu sai
};
const checkUserExist = async (email, phone) => {
    let user = await db.User.findOne({
        where: {
            [Op.or]: [{ email: email }, { phone: phone }]
        }
    });
    if (user) {
        if (user.email === email) return "Email";
        if (user.phone === phone) return "Phone";
    }
    return null;
};
const registerNewUser = async (rawUserData) => {
    try {
        const existType = await checkUserExist(rawUserData.email, rawUserData.phone);

        if (existType === "Email") {
            return {
                EM: "Email already exists",
                EC: errorCode.ALREADY_EXIST
            };
        }
        if (existType === "Phone") {
            return {
                EM: "Phone number already exists",
                EC: errorCode.ALREADY_EXIST
            };
        }

        let hashPassword = await hashUserPassword(rawUserData.password);

        const newUser = await db.User.create({
            email: rawUserData.email,
            phone: rawUserData.phone,
            password: hashPassword,
            fullName: rawUserData.fullName,
            gender: rawUserData.gender !== undefined ? rawUserData.gender : null // 1 - true: Nam
        });

        const customerRole = await db.Role.findOne({ where: { name: ROLES.CUSTOMER } });
        if (customerRole) {
            await db.UserRole.create({
                userId: newUser.id,
                roleId: customerRole.id
            });
        }

        return { EM: 'Đăng ký tài khoản thành công!', EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        console.error(">>> Lỗi tại authService:", error);
        return { EM: 'Lỗi hệ thống khi đăng ký', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const userLogin = async (rawUserData, guestSessionId = null) => {
    try {
        const user = await db.User.findOne({
            where: {
                [Op.or]: [
                    { email: rawUserData.loginValue },
                    { phone: rawUserData.loginValue }
                ]
            }
        });

        if (user) {
            const isCorrectPassword = await checkPassword(rawUserData.password, user.password);

            if (isCorrectPassword === true) {
                // Sử dụng rbacService để lấy đầy đủ Role và Permission (đã gộp & khử trùng)
                const { roles, permissions } = await rbacService.getUserFullDetails(user.id);

                let payload = {
                    id: user.id,
                    fullName: user.fullName,
                    role: roles[0] || ROLES.CUSTOMER,
                    roles: roles,
                    permissions: permissions
                };
                let accessToken = createAccessJWT(payload);
                let refreshToken = createRefreshJWT(payload);
                await user.update({
                    refresh_token: refreshToken
                });

                // Liên kết lịch sử chat của khách vào User vừa đăng nhập
                if (guestSessionId) {
                    await db.ChatLog.update(
                        { userId: user.id },
                        {
                            where: {
                                sessionId: guestSessionId,
                                userId: null
                            }
                        }
                    );
                }

                return {
                    EM: 'Success!',
                    EC: errorCode.SUCCESS,
                    DT: {
                        access_token: accessToken,
                        refresh_token: refreshToken, // Trả thêm cái này cho Controller cất vào Cookie
                        user: {
                            id: user.id,
                            role: roles[0] || ROLES.CUSTOMER,
                            roles: roles,
                            permissions: permissions,
                            fullName: user.fullName
                        }
                    }
                }

            } else {
                return {
                    EM: 'Your email/phone number or password is incorrect!',
                    EC: errorCode.UNAUTHENTICATED,
                    DT: ''
                }
            }
        } else {
            return {
                EM: 'Your email/phone number or password is incorrect!',
                EC: errorCode.UNAUTHENTICATED,
                DT: ''
            }
        }

    } catch (e) {
        console.log("error: ", e)
        return {
            EM: 'Something is wrong in service.',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        }
    }
}
const logoutUser = async (refreshToken) => {
    try {
        await db.User.update(
            { refresh_token: null },
            {
                where: { refresh_token: refreshToken }
            }
        );
        return {
            EM: 'Đăng xuất thành công!',
            EC: errorCode.SUCCESS,
            DT: ''
        };
    } catch (e) {
        console.error(">>> Lỗi tại authService (Logout):", e);
        return {
            EM: 'Lỗi hệ thống khi đăng xuất',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        };
    }
}
const refreshUserToken = async (oldRefreshToken) => {
    try {
        const decoded = verifyRefreshToken(oldRefreshToken);
        if (!decoded) {
            return {
                EM: 'Refresh Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!',
                EC: errorCode.UNAUTHENTICATED,
                DT: ''
            };
        }

        // 2. Kiểm tra xem token này có tồn tại trong Database không (chống fake token)
        const user = await db.User.findOne({
            where: { refresh_token: oldRefreshToken }
        });

        if (!user) {
            return {
                EM: 'Refresh Token không khớp với hệ thống. Vui lòng đăng nhập lại!',
                EC: errorCode.UNAUTHENTICATED,
                DT: ''
            };
        }

        // Lấy lại Role/Perm mới nhất từ rbacService
        const { roles, permissions } = await rbacService.getUserFullDetails(user.id);

        const payload = {
            id: user.id,
            fullName: user.fullName,
            role: roles[0] || ROLES.CUSTOMER,
            roles: roles,
            permissions: permissions
        };

        const newAccessToken = createAccessJWT(payload);
        const newRefreshToken = createRefreshJWT(payload);

        await user.update({
            refresh_token: newRefreshToken
        });

        return {
            EM: 'Lấy lại Token thành công!',
            EC: errorCode.SUCCESS,
            DT: {
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
                user: {
                    email: user.email,
                    phone: user.phone,
                    role: roles[0] || ROLES.CUSTOMER,
                    roles: roles,
                    permissions: permissions,
                    fullName: user.fullName
                }
            }
        };

    } catch (e) {
        console.error(">>> Lỗi tại authService (Refresh):", e);
        return {
            EM: 'Lỗi hệ thống khi refresh token',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        };
    }
}
const changePassword = async (userId, oldPassword, newPassword) => {
    try {
        const user = await db.User.findOne({
            where: { id: userId }
        });

        if (!user) {
            return {
                EM: 'Người dùng không tồn tại!',
                EC: errorCode.NOT_FOUND,
                DT: ''
            };
        }

        const isCorrectPassword = await checkPassword(oldPassword, user.password);

        if (!isCorrectPassword) {
            return {
                EM: 'Mật khẩu cũ không chính xác!',
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            };
        }

        const hashNewPassword = await hashUserPassword(newPassword);

        await user.update({
            password: hashNewPassword
        });

        return {
            EM: 'Đổi mật khẩu thành công!',
            EC: errorCode.SUCCESS,
            DT: ''
        };

    } catch (e) {
        console.error(">>> Lỗi tại authService (Change Password):", e);
        return {
            EM: 'Lỗi hệ thống khi đổi mật khẩu',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        };
    }
}
const handleSendOtp = async (email) => {
    try {
        const user = await db.User.findOne({ where: { email: email } });
        if (!user) {
            return { EM: 'Email không tồn tại trong hệ thống!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        //  Lưu OTP vào Redis  Hạn sử dụng: 300s (5 phút)
        await redisHelper.setCache(`otp:${user.email}`, otpCode, 300);

        //  Ném việc gửi email vào Redis Queue để API phản hồi ngay lập tức (Non-blocking)
        await redisHelper.pushEmailQueue({ email: user.email, otpCode });

        return {
            EM: 'Mã OTP đã được gửi đến email của bạn!',
            EC: errorCode.SUCCESS,
            DT: ''
        };
    } catch (error) {
        console.error(">>> Lỗi service handleSendOtp:", error);
        return { EM: 'Lỗi khi xử lý OTP', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};
const handleResetPasswordWithOtp = async (email, otp, newPassword) => {
    try {
        //  Lấy OTP từ Redis
        const cachedOtp = await redisHelper.getCache(`otp:${email}`);

        if (!cachedOtp) {
            return { EM: 'Mã OTP đã hết hạn hoặc bạn chưa yêu cầu!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        // Đối chiếu dữ liệu (An toàn 100%, chống IDOR)
        if (cachedOtp !== otp) {
            return { EM: 'Mã OTP không chính xác!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        const user = await db.User.findOne({ where: { email: email } });
        if (!user) return { EM: 'Không tìm thấy tài khoản!', EC: errorCode.NOT_FOUND, DT: '' };

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(newPassword, salt);

        await user.update({ password: hashPassword });

        // Xóa OTP sau khi đổi pass thành công để chống Reuse
        await redisHelper.delCache(`otp:${email}`);

        return { EM: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.', EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        console.error(">>> Lỗi service handleResetPasswordWithOtp:", error);
        return { EM: 'Lỗi khi đặt lại mật khẩu', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};
module.exports = {
    registerNewUser,
    userLogin,
    logoutUser,
    refreshUserToken,
    changePassword,
    handleSendOtp,
    handleResetPasswordWithOtp
}