const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const redisHelper = require('../helpers/redis.helper');

const CACHE_KEY = 'cache:colors';

const getAllColors = async () => {
    try {
        const cached = await redisHelper.getCache(CACHE_KEY);
        if (cached) return { EM: 'Thành công (Cache)', EC: errorCode.SUCCESS, DT: cached };

        const colors = await db.Color.findAll({
            attributes: ['id', 'name', 'hexCode']
        });
        
        await redisHelper.setCache(CACHE_KEY, colors, 86400); // 1 ngày
        return { EM: 'Thành công', EC: errorCode.SUCCESS, DT: colors };
    } catch (e) {
        console.error(">>> Error in colorService.getAllColors:", e);
        return { EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

const createColor = async (data) => {
    try {
        if (!data.name || !data.hexCode) {
            return { EM: 'Thiếu name hoặc hexCode!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        const exist = await db.Color.findOne({ where: { name: data.name } });
        if (exist) {
            return { EM: 'Tên màu đã tồn tại!', EC: errorCode.ALREADY_EXIST, DT: '' };
        }

        const newColor = await db.Color.create({
            name: data.name,
            hexCode: data.hexCode
        });

        await redisHelper.delCache(CACHE_KEY);

        return { EM: 'Tạo màu mới thành công!', EC: errorCode.SUCCESS, DT: newColor };
    } catch (e) {
        console.error(">>> Error in colorService.createColor:", e);
        return { EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

const updateColor = async (id, data) => {
    try {
        if (!data.name || !data.hexCode) {
            return { EM: 'Thiếu name hoặc hexCode!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        const color = await db.Color.findByPk(id);
        if (!color) {
            return { EM: 'Không tìm thấy màu!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        const exist = await db.Color.findOne({ where: { name: data.name } });
        if (exist && exist.id !== Number(id)) {
            return { EM: 'Tên màu đã tồn tại trên một màu khác!', EC: errorCode.ALREADY_EXIST, DT: '' };
        }

        await color.update({
            name: data.name,
            hexCode: data.hexCode
        });

        await redisHelper.delCache(CACHE_KEY);

        return { EM: 'Cập nhật thành công!', EC: errorCode.SUCCESS, DT: color };
    } catch (e) {
        console.error(">>> Error in colorService.updateColor:", e);
        return { EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

const deleteColor = async (id) => {
    try {
        const color = await db.Color.findByPk(id);
        if (!color) {
            return { EM: 'Không tìm thấy màu!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        // Kiểm tra xem có variant nào đang dùng không
        const variantCount = await db.ProductVariant.count({ where: { colorId: id } });
        if (variantCount > 0) {
            return { EM: 'Không thể xóa vì đang có sản phẩm dùng màu này!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        await color.destroy();
        await redisHelper.delCache(CACHE_KEY);

        return { EM: 'Xóa màu thành công!', EC: errorCode.SUCCESS, DT: '' };
    } catch (e) {
        console.error(">>> Error in colorService.deleteColor:", e);
        return { EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

module.exports = {
    getAllColors, createColor, updateColor, deleteColor
};
