const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const { Op } = require('sequelize');

const createCoupon = async (data) => {
    let currentStep = 'Khởi tạo createCoupon';
    try {
        currentStep = 'Kiểm tra mã code đã tồn tại chưa';
        const existingCoupon = await db.Coupon.findOne({
            where: { code: data.code }
        });

        if (existingCoupon) {
            return {
                EM: `Mã giảm giá ${data.code} đã tồn tại trong hệ thống!`,
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            };
        }

        currentStep = 'Tạo mới Coupon vào DB';
        const newCoupon = await db.Coupon.create({
            code: data.code,
            discountType: data.discountType,
            discountValue: data.discountValue,
            minOrderValue: data.minOrderValue || 0,
            maxDiscountAmount: data.maxDiscountAmount || null,
            startDate: data.startDate,
            endDate: data.endDate,
            usageLimit: data.usageLimit,
            usedCount: 0, // Mới tạo thì chắc chắn chưa ai dùng
            isActive: data.isActive
        });

        return { EM: 'Tạo mã giảm giá thành công!', EC: errorCode.SUCCESS, DT: newCoupon };

    } catch (error) {
        console.error(`\n[CRITICAL ERROR] Lỗi tại createCoupon!`);
        console.error(`- Input Data:`, data);
        console.error(`- CHẾT TẠI BƯỚC: ${currentStep}`);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);
        return { EM: 'Lỗi server khi tạo mã giảm giá', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const getAdminCoupons = async (queryParams) => {
    let currentStep = 'Khởi tạo getAdminCoupons';
    try {
        currentStep = 'Xử lý tham số phân trang & bộ lọc';
        const page = parseInt(queryParams.page) || 1;
        const limit = parseInt(queryParams.limit) || 10;
        const offset = (page - 1) * limit;

        let whereCondition = {};

        if (queryParams.isActive !== undefined && queryParams.isActive !== null && queryParams.isActive !== '') {
            whereCondition.isActive = queryParams.isActive;
        }

        // Nếu có chữ search truyền lên -> Tìm kiếm theo mã code (Không phân biệt hoa thường)
        if (queryParams.search) {
            whereCondition.code = {
                [Op.like]: `%${queryParams.search}%`
            };
        }

        currentStep = 'Query DB lấy danh sách Coupons';
        const { count, rows } = await db.Coupon.findAndCountAll({
            where: whereCondition,
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
            attributes: { exclude: ['deletedAt'] }
        });

        currentStep = 'Tính toán phân trang';
        const totalPages = Math.ceil(count / limit);

        return {
            EM: 'Lấy danh sách mã giảm giá thành công!',
            EC: errorCode.SUCCESS,
            DT: {
                totalItems: count,
                totalPages: totalPages,
                currentPage: page,
                coupons: rows
            }
        };

    } catch (error) {
        console.error(`\n[CRITICAL ERROR] Lỗi tại getAdminCoupons!`);
        console.error(`- Query Params:`, queryParams);
        console.error(`- CHẾT TẠI BƯỚC: ${currentStep} `);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);
        return { EM: 'Lỗi server khi lấy danh sách mã giảm giá', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const updateCoupon = async (id, data) => {
    let currentStep = 'Khởi tạo updateCoupon';
    try {
        currentStep = 'Tìm Coupon cần sửa';
        const coupon = await db.Coupon.findOne({ where: { id: id } });

        if (!coupon) {
            return { EM: 'Mã giảm giá không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        currentStep = 'Kiểm tra trùng lặp mã code (nếu Admin có đổi code)';
        if (data.code && data.code !== coupon.code) {
            const existingCode = await db.Coupon.findOne({ where: { code: data.code } });
            if (existingCode) {
                return { EM: `Mã code ${data.code} đã bị trùng với mã khác!`, EC: errorCode.VALIDATION_ERROR, DT: '' };
            }
        }

        currentStep = 'Tiến hành cập nhật dữ liệu';
        await coupon.update(data); // Tính năng cực hay của Sequelize: Gửi field nào, nó update field đó

        return { EM: 'Cập nhật mã giảm giá thành công!', EC: errorCode.SUCCESS, DT: coupon };

    } catch (error) {
        console.error(`\n[CRITICAL ERROR] Lỗi tại updateCoupon!`);
        console.error(`- ID: ${id} | Data Update:`, data);
        console.error(`- CHẾT TẠI BƯỚC: ${currentStep}`);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);
        return { EM: 'Lỗi server khi cập nhật mã giảm giá', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const deleteCoupon = async (id) => {
    let currentStep = 'Khởi tạo deleteCoupon';
    try {
        currentStep = 'Tìm Coupon cần xóa';
        const coupon = await db.Coupon.findOne({ where: { id: id } });

        if (!coupon) {
            return { EM: 'Mã giảm giá không tồn tại hoặc đã bị xóa!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        currentStep = 'Thực hiện Xóa Mềm (Soft Delete)';
        await coupon.destroy();

        return { EM: 'Đã xóa mã giảm giá thành công!', EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        console.error(`\n[CRITICAL ERROR] Lỗi tại deleteCoupon!`);
        console.error(`- Coupon ID: ${id}`);
        console.error(`- CHẾT TẠI BƯỚC:  ${currentStep}`);
        console.error(`- Chi tiết lỗi: ${error.message}\n`);
        return { EM: 'Lỗi server khi xóa mã giảm giá', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
module.exports = {
    createCoupon, deleteCoupon, updateCoupon, getAdminCoupons
};