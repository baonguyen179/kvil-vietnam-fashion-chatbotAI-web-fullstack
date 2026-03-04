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
const createNewAddress = async (userId, addressData) => {
    try {
        const addressCount = await db.UserAddress.count({
            where: { userId: userId }
        });

        let isDefault = addressData.isDefault === true;

        if (addressCount === 0) {
            isDefault = true;
        }

        if (isDefault && addressCount > 0) {
            await db.UserAddress.update(
                { isDefault: false },
                { where: { userId: userId } }
            );
        }

        const newAddress = await db.UserAddress.create({
            userId: userId,
            receiverName: addressData.receiverName,
            phoneNumber: addressData.phoneNumber,
            province: addressData.province,
            ward: addressData.ward,
            detailAddress: addressData.detailAddress,
            isDefault: isDefault
        });

        return {
            EM: 'Thêm địa chỉ mới thành công!',
            EC: errorCode.SUCCESS,
            DT: newAddress
        };

    } catch (error) {
        console.error(">>> Lỗi tại userService (createNewAddress):", error);
        return {
            EM: 'Lỗi hệ thống khi thêm địa chỉ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        };
    }
}
const updateUserAddress = async (userId, addressId, addressData) => {
    try {
        const address = await db.UserAddress.findOne({
            where: {
                id: addressId,
                userId: userId
            }
        });

        if (!address) {
            return {
                EM: 'Địa chỉ không tồn tại hoặc bạn không có quyền chỉnh sửa!',
                EC: errorCode.NOT_FOUND,
                DT: ''
            };
        }

        if (addressData.isDefault === true) {
            await db.UserAddress.update(
                { isDefault: false },
                { where: { userId: userId } }
            );
        } else if (addressData.isDefault === false && address.isDefault === true) {
            addressData.isDefault = true;
        }

        await address.update({
            receiverName: addressData.receiverName !== undefined ? addressData.receiverName : address.receiverName,
            phoneNumber: addressData.phoneNumber !== undefined ? addressData.phoneNumber : address.phoneNumber,
            province: addressData.province !== undefined ? addressData.province : address.province,
            ward: addressData.ward !== undefined ? addressData.ward : address.ward,
            detailAddress: addressData.detailAddress !== undefined ? addressData.detailAddress : address.detailAddress,
            isDefault: addressData.isDefault !== undefined ? addressData.isDefault : address.isDefault
        });

        return {
            EM: 'Cập nhật địa chỉ thành công!',
            EC: errorCode.SUCCESS,
            DT: address
        };

    } catch (error) {
        console.error(">>> Lỗi tại userService (updateUserAddress):", error);
        return {
            EM: 'Lỗi hệ thống khi cập nhật địa chỉ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        };
    }
}
const deleteUserAddress = async (userId, addressId) => {
    try {
        const address = await db.UserAddress.findOne({
            where: {
                id: addressId,
                userId: userId
            }
        });

        if (!address) {
            return {
                EM: 'Địa chỉ không tồn tại hoặc bạn không có quyền xóa!',
                EC: errorCode.NOT_FOUND,
                DT: ''
            };
        }

        const wasDefault = address.isDefault;

        await address.destroy();

        if (wasDefault) {
            const nextAddress = await db.UserAddress.findOne({
                where: { userId: userId },
                order: [['createdAt', 'DESC']] // Lấy cái tạo gần nhất
            });

            if (nextAddress) {
                await nextAddress.update({ isDefault: true });
            }
        }

        return {
            EM: 'Xóa địa chỉ thành công!',
            EC: errorCode.SUCCESS,
            DT: ''
        };

    } catch (error) {
        console.error(">>> Lỗi tại userService (deleteUserAddress):", error);
        return {
            EM: 'Lỗi hệ thống khi xóa địa chỉ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        };
    }
}
const setDefaultAddress = async (userId, addressId) => {
    try {
        const address = await db.UserAddress.findOne({
            where: { id: addressId, userId: userId }
        });

        if (!address) {
            return {
                EM: 'Địa chỉ không tồn tại!',
                EC: errorCode.NOT_FOUND,
                DT: ''
            };
        }

        await db.UserAddress.update(
            { isDefault: false },
            { where: { userId: userId } }
        );

        await address.update({ isDefault: true });

        return {
            EM: 'Đã đặt làm địa chỉ mặc định!',
            EC: errorCode.SUCCESS,
            DT: ''
        };
    } catch (error) {
        console.error(">>> Lỗi tại userService (setDefaultAddress):", error);
        return { EM: 'Lỗi server', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
module.exports = {
    getUserProfile, updateUserProfile,
    getUserAddresses, createNewAddress, updateUserAddress, deleteUserAddress, setDefaultAddress
}