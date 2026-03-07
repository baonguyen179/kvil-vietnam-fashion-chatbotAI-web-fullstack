const categoryService = require('../service/categoryService');
const errorCode = require('../config/errorCodes');
const categoryValidation = require('../validations/categoryValidation');

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
        const { error, value } = categoryValidation.createCategorySchema.validate(req.body);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await categoryService.createCategory(value);

        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi tại categoryController (handleCreateCategory):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleUpdateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const { error: idError } = categoryValidation.categoryIdSchema.validate({ id: categoryId });
        if (idError) return res.status(200).json({ EM: idError.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const { error: bodyError, value } = categoryValidation.updateCategorySchema.validate(req.body);
        if (bodyError) return res.status(200).json({ EM: bodyError.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await categoryService.updateCategory(categoryId, value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller:", error);
        return res.status(500).json({ EM: 'Lỗi server', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleDeleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const { error } = categoryValidation.categoryIdSchema.validate({ id: categoryId });
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await categoryService.deleteCategory(categoryId);

        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleDeleteCategory):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}

module.exports = {
    handleCreateCategory,
    handleGetAllCategories,
    handleUpdateCategory,
    handleDeleteCategory
}