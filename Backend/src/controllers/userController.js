const userService = require('../service/userService');
const userValidation = require('../validations/userValidation');
const errorCode = require('../config/errorCodes');

const handleGetUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const data = await userService.getUserProfile(userId);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi tại userController (handleGetUserProfile):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
const handleUpdateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const { error, value } = userValidation.updateUserProfileSchema.validate(req.body);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await userService.updateUserProfile(userId, value);

        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi tại userController (handleUpdateUserProfile):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleGetUserAddresses = async (req, res) => {
    try {
        const userId = req.user.id;

        const data = await userService.getUserAddresses(userId);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi tại userController (handleGetUserAddresses):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
const handleCreateUserAddress = async (req, res) => {
    try {
        const userId = req.user.id;

        const { error, value } = userValidation.createUserAddressSchema.validate(req.body);

        if (error) {
            return res.status(200).json({
                EM: error.details[0].message,
                EC: errorCode.VALIDATION_ERROR,
                DT: ""
            });
        }
        const data = await userService.createNewAddress(userId, value);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi tại userController (handleCreateUserAddress):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
const handleUpdateUserAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;

        const { error: idError } = userValidation.addressIdSchema.validate({ id: addressId });
        if (idError) {
            return res.status(200).json({ EM: idError.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: "" });
        }

        const { error: bodyError, value } = userValidation.createUserAddressSchema.validate(req.body);
        if (bodyError) {
            return res.status(200).json({ EM: bodyError.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: "" });
        }

        const data = await userService.updateUserAddress(userId, addressId, value);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi tại userController (handleUpdateUserAddress):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleDeleteUserAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;

        const { error } = userValidation.addressIdSchema.validate({ id: addressId });
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: "" });
        }

        const data = await userService.deleteUserAddress(userId, addressId);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi tại userController (handleDeleteUserAddress):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleSetDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;

        const { error } = userValidation.addressIdSchema.validate({ id: addressId });
        if (error) {
            return res.status(200).json({
                EM: error.details[0].message,
                EC: errorCode.VALIDATION_ERROR,
                DT: ""
            });
        }

        const data = await userService.setDefaultAddress(userId, addressId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleSetDefaultAddress):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleGetAdminUsers = async (req, res) => {
    try {
        const { error, value } = userValidation.getAdminUserListSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await userService.getAdminUsers(value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetAdminUsers):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleUpdateUserRole = async (req, res) => {
    try {
        const adminId = req.user.id;
        const targetUserId = req.params.id;

        const { error: idError } = userValidation.userIdSchema.validate({ id: targetUserId });
        if (idError) return res.status(200).json({ EM: idError.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const { error: bodyError, value } = userValidation.updateUserRoleSchema.validate(req.body);
        if (bodyError) return res.status(200).json({ EM: bodyError.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await userService.updateUserRole(adminId, targetUserId, value.role);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleUpdateUserRole):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}

module.exports = {
    handleGetUserProfile, handleUpdateUserProfile,
    handleGetUserAddresses, handleCreateUserAddress, handleUpdateUserAddress, handleDeleteUserAddress, handleSetDefaultAddress,
    handleGetAdminUsers, handleUpdateUserRole
}