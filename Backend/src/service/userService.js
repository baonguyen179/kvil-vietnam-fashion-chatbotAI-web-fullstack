const db = require('../models/index');
const bcrypt = require('bcryptjs');
const errorCode = require('../config/errorCodes');
const redisHelper = require('../helpers/redis.helper');
const { Op } = require('sequelize');
const { ROLES } = require('../config/roles');
const rbacService = require('./rbacService');

//tạo key cache cho chuẩn xác và tái sử dụng
const getProfileCacheKey = (userId) => `user:profile:${userId}`;
const getAddressCacheKey = (userId) => `user:addresses:${userId}`;

const getUserProfile = async (userId) => {
    try {
        const cacheKey = getProfileCacheKey(userId);
        const cachedData = await redisHelper.getCache(cacheKey);

        if (cachedData) {
            return {
                EM: 'Lấy thông tin hồ sơ (Cache) thành công!',
                EC: errorCode.SUCCESS,
                DT: cachedData
            };
        }
        const user = await db.User.findOne({
            where: { id: userId },
            attributes: {
                exclude: ['password', 'refresh_token']
            }
        });

        if (user) {
            const { roles, permissions } = await rbacService.getUserFullDetails(userId);
            user.setDataValue('role', roles[0] || ROLES.CUSTOMER);
            user.setDataValue('roles', roles);
            user.setDataValue('permissions', permissions);
        }

        if (!user) {
            return {
                EM: 'Không tìm thấy thông tin người dùng!',
                EC: errorCode.NOT_FOUND,
                DT: ''
            };
        }
        //Set Cache cho lần gọi tiếp theo (Lưu 1 tiếng = 3600s)
        await redisHelper.setCache(cacheKey, user, 3600);
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
        if (updatedUser) {
            const { roles, permissions } = await rbacService.getUserFullDetails(userId);
            updatedUser.setDataValue('role', roles[0] || ROLES.CUSTOMER);
            updatedUser.setDataValue('roles', roles);
            updatedUser.setDataValue('permissions', permissions);
        }
        //xóa cache ngay khi có cập nhật để tránh sai lệch dữ liệu
        await redisHelper.delCache(getProfileCacheKey(userId));

        return { EM: 'Cập nhật hồ sơ thành công!', EC: errorCode.SUCCESS, DT: updatedUser };

    } catch (error) {
        console.error(">>> Lỗi tại userService (updateUserProfile):", error);
        return { EM: 'Lỗi hệ thống khi cập nhật hồ sơ', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const getUserAddresses = async (userId) => {
    try {
        const cacheKey = getAddressCacheKey(userId);
        const cachedData = await redisHelper.getCache(cacheKey);

        if (cachedData) {
            return {
                EM: 'Lấy danh sách địa chỉ (Cache) thành công!',
                EC: errorCode.SUCCESS,
                DT: cachedData
            };
        }

        const addresses = await db.UserAddress.findAll({
            where: { userId: userId },
            order: [
                ['isDefault', 'DESC'],
                ['createdAt', 'DESC']
            ]
        });
        await redisHelper.setCache(cacheKey, addresses, 3600);
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
        await redisHelper.delCache(getAddressCacheKey(userId));
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

        await redisHelper.delCache(getAddressCacheKey(userId));
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
        await redisHelper.delCache(getAddressCacheKey(userId));
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
        //Phá cache
        await redisHelper.delCache(getAddressCacheKey(userId));
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

        const includeCondition = [];
        let whereCondition = {};
        // (Moved logic up to handle queryParams.role)

        if (queryParams.role) {
            includeCondition.push({
                model: db.Role,
                as: 'roles',
                where: { name: queryParams.role }
            });
        } else {
            includeCondition.push({ model: db.Role, as: 'roles' });
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
            include: includeCondition,
            distinct: true, // Quan trọng khi dùng include N-N để không bị đếm lặp
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
            attributes: { exclude: ['password', 'refresh_token'] }
        });

        // Map dữ liệu để thêm trường 'role' cho Frontend
        const mappedUsers = rows.map(u => {
            const userPlain = u.get({ plain: true });
            userPlain.role = userPlain.roles?.[0]?.name || ROLES.CUSTOMER;
            userPlain.roles = userPlain.roles?.map(r => r.name) || [];
            return userPlain;
        });

        const totalPages = Math.ceil(count / limit);

        return {
            EM: 'Lấy danh sách người dùng thành công!',
            EC: errorCode.SUCCESS,
            DT: {
                totalItems: count,
                totalPages: totalPages,
                currentPage: page,
                users: mappedUsers
            }
        };

    } catch (error) {
        console.error(`\n[CRITICAL ERROR] Lỗi tại getAdminUsers!`);
        console.error(`- CHẾT TẠI BƯỚC: ${currentStep}`);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);
        return { EM: 'Lỗi server khi lấy danh sách người dùng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const updateUserRolesAndPermissions = async (adminId, adminRole, targetUserId, newRoleNames, newPermissionNames) => {
    let currentStep = 'Khởi tạo updateUserRolesAndPermissions';
    try {
        if (adminRole !== ROLES.SUPER_ADMIN) {
            return { EM: 'Chỉ SUPER_ADMIN mới có quyền thực hiện hành động này!', EC: errorCode.UNAUTHORIZED, DT: '' };
        }

        if (adminId.toString() === targetUserId.toString()) {
            return { EM: 'Bạn không thể tự thay đổi quyền của chính mình!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        currentStep = 'Xử lý gán Roles';
        if (newRoleNames) {
            const roles = await db.Role.findAll({ where: { name: { [Op.in]: newRoleNames } } });
            await rbacService.syncUserRoles(targetUserId, roles.map(r => r.id));
        }

        currentStep = 'Xử lý gán Permissions cá nhân';
        if (newPermissionNames) {
            const perms = await db.Permission.findAll({ where: { name: { [Op.in]: newPermissionNames } } });
            await rbacService.syncUserPermissions(targetUserId, perms.map(p => p.id));
        }

        return { EM: 'Cập nhật phân quyền người dùng thành công!', EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        console.error(`>>> Lỗi tại updateUserRolesAndPermissions:`, error);
        return { EM: 'Lỗi server khi cập nhật phân quyền', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const createAdminUser = async (rawUserData) => {
    try {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawUserData.loginValue);
        const email = isEmail ? rawUserData.loginValue : null;
        const phone = !isEmail ? rawUserData.loginValue : null;

        // 1. Kiểm tra tồn tại
        const existingUser = await db.User.findOne({
            where: {
                [Op.or]: [
                    ...(email ? [{ email }] : []),
                    ...(phone ? [{ phone }] : [])
                ]
            }
        });

        if (existingUser) {
            return {
                EM: `Tài khoản với ${isEmail ? 'Email' : 'Số điện thoại'} này đã tồn tại!`,
                EC: errorCode.ALREADY_EXIST,
                DT: ''
            };
        }

        // 2. Hash mật khẩu
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = await bcrypt.hash(rawUserData.password, salt);

        // 3. Lấy RoleId mặc định cho CUSTOMER
        const customerRole = await db.Role.findOne({ where: { name: ROLES.CUSTOMER } });

        // 4. Tạo User
        const newUser = await db.User.create({
            email,
            phone,
            password: hashPassword,
            fullName: rawUserData.fullName || 'Người dùng mới'
        });

        if (customerRole) {
            await db.UserRole.create({
                userId: newUser.id,
                roleId: customerRole.id
            });
        }

        // Loại bỏ password trước khi trả về
        const userResponse = newUser.get({ plain: true });
        delete userResponse.password;
        userResponse.role = ROLES.CUSTOMER;

        return {
            EM: 'Tạo tài khoản người dùng thành công!',
            EC: errorCode.SUCCESS,
            DT: userResponse
        };

    } catch (error) {
        console.error(">>> Lỗi tại userService (createAdminUser):", error);
        return { EM: 'Lỗi hệ thống khi tạo người dùng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}

module.exports = {
    getUserProfile, updateUserProfile,
    getUserAddresses, createNewAddress, updateUserAddress, deleteUserAddress, setDefaultAddress,
    getAdminUsers, updateUserRolesAndPermissions, createAdminUser
}