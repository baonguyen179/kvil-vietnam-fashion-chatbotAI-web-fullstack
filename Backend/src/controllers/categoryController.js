const categoryService = require('../service/categoryService');
const errorCode = require('../config/errorCodes');

const handleGetAllCategories = async (req, res) => {
    try {
        const data = await categoryService.getAllCategories();
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller:", error);
        return res.status(500).json({ EM: 'Lỗi server', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleCreateCategory = async (req, res) => {
    try {
        const data = await categoryService.createCategory(req.body);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi tại categoryController (handleCreateCategory):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
const handleUpdateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        if (!categoryId) {
            return res.status(200).json({ EM: 'Thiếu ID danh mục!', EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await categoryService.updateCategory(categoryId, req.body);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller:", error);
        return res.status(500).json({ EM: 'Lỗi server', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleDeleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        if (!categoryId) {
            return res.status(200).json({
                EM: 'Thiếu ID danh mục cần xóa!',
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            });
        }

        const data = await categoryService.deleteCategory(categoryId);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi controller (handleDeleteCategory):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}

module.exports = {
    handleCreateCategory,
    handleGetAllCategories,
    handleUpdateCategory,
    handleDeleteCategory
}