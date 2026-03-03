const db = require('../models/index');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const errorCode = require('../config/errorCodes');
const { createAccessJWT, createRefreshJWT } = require('../middleware/JWTAction');

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

module.exports = {
    registerNewUser,
    userLogin
}