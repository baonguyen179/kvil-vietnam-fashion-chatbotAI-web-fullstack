const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const slugify = require('slugify');

const getAllCategories = async () => {
    try {
        const categories = await db.Category.findAll({
            attributes: ['id', 'name', 'slug'],
            order: [['name', 'ASC']]
        });

        return {
            EM: 'Lấy danh sách danh mục thành công!',
            EC: errorCode.SUCCESS,
            DT: categories
        };
    } catch (error) {
        console.error(">>> Lỗi tại categoryService (getAllCategories):", error);
        return { EM: 'Lỗi server', EC: errorCode.OTHER_ERROR, DT: [] };
    }
}

const createCategory = async (categoryData) => {
    try {
        if (!categoryData.name) {
            return {
                EM: 'Tên danh mục không được để trống!',
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            };
        }

        const generatedSlug = slugify(categoryData.name, {
            lower: true,      // Chuyển hết thành chữ thường
            strict: true,     // Loại bỏ các ký tự đặc biệt (!, @, #...)
            locale: 'vi'      // Hỗ trợ tốt tiếng Việt
        });

        const isExist = await db.Category.findOne({
            where: { slug: generatedSlug }
        });

        if (isExist) {
            return {
                EM: 'Danh mục này đã tồn tại!',
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            };
        }

        const newCategory = await db.Category.create({
            name: categoryData.name,
            slug: generatedSlug
        });

        return {
            EM: 'Tạo danh mục mới thành công!',
            EC: errorCode.SUCCESS,
            DT: newCategory
        };

    } catch (error) {
        console.error(">>> Lỗi tại categoryService (createCategory):", error);
        return {
            EM: 'Lỗi hệ thống khi tạo danh mục',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        };
    }
}
const updateCategory = async (id, categoryData) => {
    try {
        if (!categoryData.name) {
            return { EM: 'Tên danh mục không được để trống!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        const category = await db.Category.findOne({ where: { id: id } });
        if (!category) {
            return { EM: 'Danh mục không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        const newSlug = slugify(categoryData.name, { lower: true, strict: true, locale: 'vi' });

        const checkDuplicate = await db.Category.findOne({ where: { slug: newSlug } });
        if (checkDuplicate && checkDuplicate.id !== id) {
            return { EM: 'Tên danh mục này đã bị trùng lặp!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        await category.update({
            name: categoryData.name,
            slug: newSlug
        });

        return { EM: 'Cập nhật danh mục thành công!', EC: errorCode.SUCCESS, DT: category };

    } catch (error) {
        console.error(">>> Lỗi tại categoryService (updateCategory):", error);
        return { EM: 'Lỗi server', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const deleteCategory = async (id) => {
    try {
        const category = await db.Category.findOne({ where: { id: id } });
        if (!category) {
            return {
                EM: 'Danh mục không tồn tại!',
                EC: errorCode.NOT_FOUND,
                DT: ''
            };
        }
        const productCount = await db.Product.count({
            where: { categoryId: id }
        });

        if (productCount > 0) {
            return {
                EM: `Không thể xóa! Đang có ${productCount} sản phẩm thuộc danh mục này. Vui lòng xóa hoặc chuyển danh mục cho các sản phẩm đó trước.`,
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            };
        }

        await category.destroy();

        return {
            EM: 'Xóa danh mục thành công!',
            EC: errorCode.SUCCESS,
            DT: ''
        };

    } catch (error) {
        console.error(">>> Lỗi tại categoryService (deleteCategory):", error);
        return { EM: 'Lỗi server khi xóa danh mục', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
module.exports = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
}