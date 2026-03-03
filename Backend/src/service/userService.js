const db = require('../models/index');
const errorCode = require('../config/errorCodes');

const getUserProfile = async (userId) => {
    try {
        const user = await db.User.findOne({
            where: { id: userId },
            attributes: {
                exclude: ['password', 'refresh_token']
            }
        });

        if (!user) {
            return {
                EM: 'Không tìm thấy thông tin người dùng!',
                EC: errorCode.NOT_FOUND,
                DT: ''
            };
        }

        return {
            EM: 'Lấy thông tin hồ sơ thành công!',
            EC: errorCode.SUCCESS,
            DT: user
        };

    } catch (error) {
        console.error(">>> Lỗi tại userService (getUserProfile):", error);
        return {
            EM: 'Lỗi hệ thống khi lấy thông tin người dùng',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        };
    }
}
const updateUserProfile = async (userId, rawData) => {
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

        await user.update({
            fullName: rawData.fullName !== undefined ? rawData.fullName : user.fullName,
            gender: rawData.gender !== undefined ? rawData.gender : user.gender,
            birthday: rawData.birthday !== undefined ? rawData.birthday : user.birthday
        });

        const updatedUser = await db.User.findOne({
            where: { id: userId },
            attributes: {
                exclude: ['password', 'refresh_token']
            }
        });

        return {
            EM: 'Cập nhật hồ sơ thành công!',
            EC: errorCode.SUCCESS,
            DT: updatedUser
        };

    } catch (error) {
        console.error(">>> Lỗi tại userService (updateUserProfile):", error);
        return {
            EM: 'Lỗi hệ thống khi cập nhật hồ sơ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        };
    }
}
const getUserAddresses = async (userId) => {
    try {
        const addresses = await db.UserAddress.findAll({
            where: { userId: userId },
            order: [
                ['isDefault', 'DESC'],
                ['createdAt', 'DESC']
            ]
        });

        return {
            EM: 'Lấy danh sách địa chỉ thành công!',
            EC: errorCode.SUCCESS,
            DT: addresses
        };

    } catch (error) {
        console.error(">>> Lỗi tại userService (getUserAddresses):", error);
        return {
            EM: 'Lỗi hệ thống khi lấy danh sách địa chỉ',
            EC: errorCode.OTHER_ERROR,
            DT: []
        };
    }
}

module.exports = {
    getUserProfile, updateUserProfile, getUserAddresses
}