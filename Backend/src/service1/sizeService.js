const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const redisHelper = require('../helpers/redis.helper');

const CACHE_KEY = 'cache:sizes';

const getAllSizes = async () => {
    try {
        const cached = await redisHelper.getCache(CACHE_KEY);
        if (cached) return { EM: 'Thành công (Cache)', EC: errorCode.SUCCESS, DT: cached };

        const sizes = await db.Size.findAll({
            attributes: ['id', 'name', 'description']
        });
        
        await redisHelper.setCache(CACHE_KEY, sizes, 86400); // 1 ngày
        return { EM: 'Thành công', EC: errorCode.SUCCESS, DT: sizes };
    } catch (e) {
        console.error(">>> Error in sizeService.getAllSizes:", e);
        return { EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

const createSize = async (data) => {
    try {
        if (!data.name) {
            return { EM: 'Thiếu name!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        const exist = await db.Size.findOne({ where: { name: data.name } });
        if (exist) {
            return { EM: 'Tên size đã tồn tại!', EC: errorCode.ALREADY_EXIST, DT: '' };
        }

        const newSize = await db.Size.create({
            name: data.name,
            description: data.description || ''
        });

        await redisHelper.delCache(CACHE_KEY);

        return { EM: 'Tạo size mới thành công!', EC: errorCode.SUCCESS, DT: newSize };
    } catch (e) {
        console.error(">>> Error in sizeService.createSize:", e);
        return { EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

const updateSize = async (id, data) => {
    try {
        if (!data.name) {
            return { EM: 'Thiếu name!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        const size = await db.Size.findByPk(id);
        if (!size) {
            return { EM: 'Không tìm thấy size!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        const exist = await db.Size.findOne({ where: { name: data.name } });
        if (exist && exist.id !== Number(id)) {
            return { EM: 'Tên size đã tồn tại trên một size khác!', EC: errorCode.ALREADY_EXIST, DT: '' };
        }

        await size.update({
            name: data.name,
            description: data.description || ''
        });

        await redisHelper.delCache(CACHE_KEY);

        return { EM: 'Cập nhật thành công!', EC: errorCode.SUCCESS, DT: size };
    } catch (e) {
        console.error(">>> Error in sizeService.updateSize:", e);
        return { EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

const deleteSize = async (id) => {
    try {
        const size = await db.Size.findByPk(id);
        if (!size) {
            return { EM: 'Không tìm thấy size!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        // Kiểm tra xem có variant nào đang dùng không
        const variantCount = await db.ProductVariant.count({ where: { sizeId: id } });
        if (variantCount > 0) {
            return { EM: 'Không thể xóa vì đang có sản phẩm dùng size này!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        await size.destroy();
        await redisHelper.delCache(CACHE_KEY);

        return { EM: 'Xóa size thành công!', EC: errorCode.SUCCESS, DT: '' };
    } catch (e) {
        console.error(">>> Error in sizeService.deleteSize:", e);
        return { EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

module.exports = {
    getAllSizes, createSize, updateSize, deleteSize
};
