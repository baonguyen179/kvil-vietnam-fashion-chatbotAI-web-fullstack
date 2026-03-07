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
const updateUserProfile = async (userId, validatedData) => {
    try {
        const user = await db.User.findOne({ where: { id: userId } });

        if (!user) {
            return { EM: 'Người dùng không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        }
        await user.update(validatedData);

        const updatedUser = await db.User.findOne({
            where: { id: userId },
            attributes: { exclude: ['password', 'refresh_token'] }
        });

        return { EM: 'Cập nhật hồ sơ thành công!', EC: errorCode.SUCCESS, DT: updatedUser };

    } catch (error) {
        console.error(">>> Lỗi tại userService (updateUserProfile):", error);
        return { EM: 'Lỗi hệ thống khi cập nhật hồ sơ', EC: errorCode.OTHER_ERROR, DT: '' };
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
            where: { id: addressId, userId: userId }
        });

        if (!address) {
            return { EM: 'Địa chỉ không tồn tại hoặc bạn không có quyền chỉnh sửa!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        if (addressData.isDefault === true) {
            await db.UserAddress.update(
                { isDefault: false },
                { where: { userId: userId } }
            );
        } else if (addressData.isDefault === false && address.isDefault === true) {
            addressData.isDefault = true;
        }

        await address.update(addressData);

        return { EM: 'Cập nhật địa chỉ thành công!', EC: errorCode.SUCCESS, DT: address };

    } catch (error) {
        console.error(">>> Lỗi tại userService (updateUserAddress):", error);
        return { EM: 'Lỗi hệ thống khi cập nhật địa chỉ', EC: errorCode.OTHER_ERROR, DT: '' };
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
const getAdminUsers = async (queryParams) => {
    let currentStep = 'Khởi tạo getAdminUsers';
    try {
        currentStep = 'Xử lý tham số phân trang & bộ lọc';
        const page = parseInt(queryParams.page) || 1;
        const limit = parseInt(queryParams.limit) || 10;
        const offset = (page - 1) * limit;

        let whereCondition = {};

        if (queryParams.role) {
            whereCondition.role = queryParams.role;
        }

        if (queryParams.search) {
            whereCondition = {
                ...whereCondition,
                [Op.or]: [
                    { email: { [Op.like]: `%${queryParams.search}%` } },
                    { fullName: { [Op.like]: `%${queryParams.search}%` } },
                    { phone: { [Op.like]: `%${queryParams.search}%` } }
                ]
            };
        }

        currentStep = 'Query DB lấy danh sách Users (Bảo mật thông tin nhạy cảm)';
        const { count, rows } = await db.User.findAndCountAll({
            where: whereCondition,
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
            attributes: { exclude: ['password', 'refresh_token'] }
        });

        const totalPages = Math.ceil(count / limit);

        return {
            EM: 'Lấy danh sách người dùng thành công!',
            EC: errorCode.SUCCESS,
            DT: {
                totalItems: count,
                totalPages: totalPages,
                currentPage: page,
                users: rows
            }
        };

    } catch (error) {
        console.error(`\n[CRITICAL ERROR] Lỗi tại getAdminUsers!`);
        console.error(`- CHẾT TẠI BƯỚC: ${currentStep}`);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);
        return { EM: 'Lỗi server khi lấy danh sách người dùng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const updateUserRole = async (adminId, targetUserId, newRole) => {
    let currentStep = 'Khởi tạo updateUserRole';
    try {
        currentStep = 'Tìm User cần đổi quyền';
        const user = await db.User.findOne({ where: { id: targetUserId } });

        if (!user) {
            return { EM: 'Người dùng không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        if (adminId.toString() === targetUserId.toString() && newRole === 'USER') {
            return { EM: 'Bạn không thể tự hạ quyền ADMIN của chính mình!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        if (user.role === newRole) {
            return { EM: `Người dùng này đã là ${newRole} rồi!`, EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        currentStep = 'Cập nhật quyền';
        await user.update({ role: newRole });

        return { EM: `Cấp quyền ${newRole} cho người dùng thành công!`, EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        console.error(`\n[CRITICAL ERROR] Lỗi tại updateUserRole!`);
        console.error(`- Target User ID: ${targetUserId} | New Role: ${newRole}`);
        console.error(`- CHẾT TẠI BƯỚC: 👉 ${currentStep} 👈`);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);
        return { EM: 'Lỗi server khi cập nhật quyền người dùng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
module.exports = {
    getUserProfile, updateUserProfile,
    getUserAddresses, createNewAddress, updateUserAddress, deleteUserAddress, setDefaultAddress,
    getAdminUsers, updateUserRole
}