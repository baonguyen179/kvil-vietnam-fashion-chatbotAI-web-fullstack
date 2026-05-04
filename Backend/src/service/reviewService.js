const db = require('../models');
const reviewHelper = require('../helpers/review.helper');
const errorCode = require('../config/errorCodes');

const reviewService = {
    createReview: async (reviewContext, files, rating, comment) => {
        const { orderItemId, productId, userId } = reviewContext;
        let t;
        try {
            t = await db.sequelize.transaction();

            // Chống Spam: Đảm bảo OrderItem này chưa từng được đánh giá
            const existingReview = await db.Review.findOne({
                where: { orderItemId },
                transaction: t,
                lock: true // Lock dòng để tránh spam request liên tục cùng lúc
            });

            if (existingReview) {
                await t.rollback();
                return { EC: errorCode.VALIDATION_ERROR, EM: 'Sản phẩm này trong đơn hàng đã được đánh giá!' };
            }

            // Chống lỗi nghiệp vụ: Đảm bảo Order đã thực sự được 'delivered'
            const orderItem = await db.OrderItem.findOne({
                where: { id: orderItemId },
                include: [{ model: db.Order, as: 'order', attributes: ['status'] }],
                transaction: t
            });

            if (!orderItem || orderItem.order.status !== 'delivered') {
                await t.rollback();
                return { EC: errorCode.VALIDATION_ERROR, EM: 'Chỉ có thể đánh giá khi đơn hàng đã giao thành công.' };
            }

            // Quét ngôn từ vi phạm
            const isClean = reviewHelper.isCleanContent(comment);
            const status = isClean ? 'APPROVED' : 'PENDING';

            // Tạo Review
            const newReview = await db.Review.create({
                productId,
                orderItemId,
                userId: userId || null,
                rating,
                comment,
                status
            }, { transaction: t });

            // Lưu hình ảnh (nếu có)
            if (files && files.length > 0) {
                const imageRecords = files.map(file => ({
                    reviewId: newReview.id,
                    imageUrl: file.path, // Cấu hình qua Multer Cloudinary
                    publicId: file.filename
                }));
                await db.ReviewImage.bulkCreate(imageRecords, { transaction: t });
            }

            // Xử lý Race Condition bằng Raw Query (Chỉ cộng dồn nếu duyệt ngay)
            if (status === 'APPROVED') {
                await db.sequelize.query(`
                    UPDATE Products 
                    SET ratingAvg = (ratingAvg * reviewCount + :rating) / (reviewCount + 1),
                        reviewCount = reviewCount + 1
                    WHERE id = :productId
                `, {
                    replacements: { rating, productId },
                    type: db.sequelize.QueryTypes.UPDATE,
                    transaction: t
                });
            }

            await t.commit();
            return { 
                EC: errorCode.SUCCESS, 
                EM: status === 'APPROVED' ? 'Đánh giá thành công!' : 'Đánh giá đã được ghi nhận và đang chờ duyệt do chứa từ nhạy cảm.' 
            };

        } catch (error) {
            if (t) await t.rollback();
            console.error('>>> createReview Error:', error);
            return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ nội bộ' };
        }
    },

    getProductReviews: async (productId, page = 1, limit = 10) => {
        try {
            const offset = (page - 1) * limit;
            const { count, rows } = await db.Review.findAndCountAll({
                where: { productId, status: 'APPROVED' },
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['createdAt', 'DESC']],
                include: [
                    { model: db.ReviewImage, as: 'images', attributes: ['imageUrl'] },
                    { model: db.User, as: 'user', attributes: ['id', 'fullName'] } // Bỏ avatar vì DB không có trường này
                ]
            });

            return {
                EC: errorCode.SUCCESS,
                DT: {
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page),
                    reviews: rows
                }
            };
        } catch (error) {
            console.error(">>> getProductReviews Error:", error);
            return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi truy xuất dữ liệu' };
        }
    },

    /**
     * Tạo danh sách review token cho từng sản phẩm trong đơn hàng đã giao.
     * - Kiểm tra đơn hàng thuộc về userId (chống IDOR)
     * - Chỉ trả token cho item CHƯA có Review (đã đánh giá thì trả reviewed: true)
     */
    getReviewTokensForOrder: async (orderId, userId) => {
        try {
            // 1. Lấy order + kiểm tra chủ sở hữu
            const order = await db.Order.findOne({
                where: { id: orderId, userId },
                include: [{
                    model: db.OrderItem,
                    as: 'orderItems',
                    include: [{
                        model: db.ProductVariant,
                        as: 'variant',
                        include: [
                            { model: db.Product, as: 'product', attributes: ['id', 'name'] },
                            { model: db.Color, as: 'color', attributes: ['name'] },
                            { model: db.Size, as: 'size', attributes: ['name'] }
                        ]
                    }]
                }]
            });

            if (!order) {
                return { EC: errorCode.UNAUTHORIZED, EM: 'Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập.' };
            }

            if (order.status !== 'delivered') {
                return { EC: errorCode.VALIDATION_ERROR, EM: 'Chỉ có thể đánh giá khi đơn hàng đã giao thành công.' };
            }

            // 2. Với từng item, kiểm tra đã review chưa, nếu chưa thì generate token
            const itemsWithTokens = await Promise.all(order.orderItems.map(async (item) => {
                const existingReview = await db.Review.findOne({
                    where: { orderItemId: item.id }
                });

                const productId = item.variant?.product?.id;
                const productName = item.variant?.product?.name;

                // Lấy ảnh chính của sản phẩm để hiển thị trong modal
                const mainImage = await db.ProductImage.findOne({
                    where: { productId, isMain: true },
                    attributes: ['imageUrl']
                });

                return {
                    orderItemId: item.id,
                    productId,
                    productName: productName || 'Sản phẩm',
                    color: item.variant?.color?.name || '',
                    size: item.variant?.size?.name || '',
                    imageUrl: mainImage?.imageUrl || null,
                    reviewed: !!existingReview,
                    // Chỉ tạo token nếu chưa review - tránh tạo thừa
                    token: existingReview ? null : reviewHelper.generateReviewToken(item.id, productId, userId)
                };
            }));

            return {
                EC: errorCode.SUCCESS,
                DT: {
                    orderId: order.id,
                    items: itemsWithTokens
                }
            };
        } catch (error) {
            console.error('>>> getReviewTokensForOrder Error:', error);
            return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ nội bộ' };
        }
    },

    getAdminReviews: async (page = 1, limit = 10, status) => {
        try {
            const offset = (page - 1) * limit;
            const whereClause = status ? { status } : {};

            const { count, rows } = await db.Review.findAndCountAll({
                where: whereClause,
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['createdAt', 'DESC']],
                include: [
                    { model: db.ReviewImage, as: 'images', attributes: ['imageUrl'] },
                    { model: db.User, as: 'user', attributes: ['id', 'fullName', 'email'] },
                    { model: db.Product, as: 'product', attributes: ['id', 'name'] }
                ]
            });

            return {
                EC: errorCode.SUCCESS,
                DT: {
                    totalItems: count,
                    totalPages: Math.ceil(count / limit),
                    currentPage: parseInt(page),
                    reviews: rows
                }
            };
        } catch (error) {
            console.error('>>> getAdminReviews Error:', error);
            return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ nội bộ' };
        }
    },

    updateReviewStatus: async (reviewId, status) => {
        let t;
        try {
            t = await db.sequelize.transaction();
            const review = await db.Review.findByPk(reviewId, { transaction: t });
            
            if (!review) {
                await t.rollback();
                return { EC: errorCode.NOT_FOUND, EM: 'Không tìm thấy đánh giá' };
            }

            review.status = status;
            await review.save({ transaction: t });

            // Nếu update sang APPROVED, tính lại điểm trung bình của sản phẩm
            if (status === 'APPROVED' || review.previous('status') === 'APPROVED') {
                const productReviews = await db.Review.findAll({
                    where: { productId: review.productId, status: 'APPROVED' },
                    attributes: ['rating'],
                    transaction: t
                });

                const reviewCount = productReviews.length;
                const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
                const ratingAvg = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;

                await db.Product.update(
                    { ratingAvg, reviewCount },
                    { where: { id: review.productId }, transaction: t }
                );
            }

            await t.commit();
            return { EC: errorCode.SUCCESS, EM: 'Cập nhật trạng thái thành công' };
        } catch (error) {
            if (t) await t.rollback();
            console.error('>>> updateReviewStatus Error:', error);
            return { EC: errorCode.OTHER_ERROR, EM: 'Lỗi máy chủ nội bộ' };
        }
    }
};

module.exports = reviewService;
