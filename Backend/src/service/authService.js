const db = require('../models/index');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const errorCode = require('../config/errorCodes');
const { createAccessJWT, createRefreshJWT, verifyRefreshToken } = require('../middleware/JWTAction');

const salt = bcrypt.genSaltSync(10);
const hashUserPassword = (userPassword) => {
    return bcrypt.hashSync(userPassword, salt);
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

        let hashPassword = hashUserPassword(rawUserData.password);

        await db.User.create({
            email: rawUserData.email,
            phone: rawUserData.phone,
            password: hashPassword,
            fullName: rawUserData.fullName,
            gender: rawUserData.gender !== undefined ? rawUserData.gender : null,//1 - true:Nam
            role: 'USER' // Gán mặc định quyền là người dùng thường
        });

        return { EM: 'Đăng ký tài khoản thành công!', EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        console.error(">>> Lỗi tại authService:", error);
        return { EM: 'Lỗi hệ thống khi đăng ký', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const userLogin = async (rawUserData) => {
    try {
        const user = await db.User.findOne({
            where: {
                [Op.or]: [
                    { email: rawUserData.loginValue },
                    { phone: rawUserData.loginValue }
                ]
            }
        })

        if (user) {
            const isCorrectPassword = await checkPassword(rawUserData.password, user.password);

            if (isCorrectPassword === true) {
                let payload = {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role,
                    gender: user.gender
                }
                let accessToken = createAccessJWT(payload);
                let refreshToken = createRefreshJWT(payload);
                await user.update({
                    refresh_token: refreshToken
                });
                return {
                    EM: 'Success!',
                    EC: errorCode.SUCCESS,
                    DT: {
                        access_token: accessToken,
                        refresh_token: refreshToken, // Trả thêm cái này cho Controller cất vào Cookie
                        user: {
                            email: user.email,
                            phone: user.phone,
                            role: user.role,
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

        const payload = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            gender: user.gender
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
                    role: user.role,
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

        const hashNewPassword = hashUserPassword(newPassword);

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
module.exports = {
    registerNewUser,
    userLogin,
    logoutUser,
    refreshUserToken,
    changePassword
}