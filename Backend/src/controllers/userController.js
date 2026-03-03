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

module.exports = {
    handleGetUserProfile, handleUpdateUserProfile, handleGetUserAddresses
}