const userService = require('../service/userService');
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

        const rawData = req.body;

        const data = await userService.updateUserProfile(userId, rawData);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi tại userController (handleUpdateUserProfile):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
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

        const { receiverName, phoneNumber, province, ward, detailAddress } = req.body;

        if (!receiverName || !phoneNumber || !province || !ward || !detailAddress) {
            return res.status(200).json({
                EM: "Vui lòng điền đầy đủ thông tin nhận hàng!",
                EC: errorCode.VALIDATION_ERROR,
                DT: ""
            });
        }

        const data = await userService.createNewAddress(userId, req.body);

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

        if (!addressId) {
            return res.status(200).json({
                EM: "Thiếu ID địa chỉ cần sửa!",
                EC: errorCode.VALIDATION_ERROR,
                DT: ""
            });
        }

        const { receiverName, phoneNumber, province, ward, detailAddress } = req.body;
        if (!receiverName || !phoneNumber || !province || !ward || !detailAddress) {
            return res.status(200).json({
                EM: "Vui lòng điền đầy đủ thông tin nhận hàng!",
                EC: errorCode.VALIDATION_ERROR,
                DT: ""
            });
        }

        const data = await userService.updateUserAddress(userId, addressId, req.body);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi tại userController (handleUpdateUserAddress):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
const handleDeleteUserAddress = async (req, res) => {
    try {
        const userId = req.user.id;

        const addressId = req.params.id;

        if (!addressId) {
            return res.status(200).json({
                EM: "Thiếu ID địa chỉ cần xóa!",
                EC: errorCode.VALIDATION_ERROR,
                DT: ""
            });
        }

        const data = await userService.deleteUserAddress(userId, addressId);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi tại userController (handleDeleteUserAddress):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
const handleSetDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const addressId = req.params.id;

        if (!addressId) {
            return res.status(200).json({
                EM: "Thiếu ID địa chỉ!",
                EC: errorCode.VALIDATION_ERROR, DT: ""
            });
        }

        const data = await userService.setDefaultAddress(userId, addressId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller:", error);
        return res.status(500).json({ EM: 'Lỗi server', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}

module.exports = {
    handleGetUserProfile, handleUpdateUserProfile,
    handleGetUserAddresses, handleCreateUserAddress, handleUpdateUserAddress, handleDeleteUserAddress, handleSetDefaultAddress
}