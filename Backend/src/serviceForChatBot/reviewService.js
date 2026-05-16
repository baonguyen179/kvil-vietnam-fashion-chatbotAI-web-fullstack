/**
 * serviceForChatBot/reviewService.js
 *
 * Service chuyên biệt cho Chatbot AI - xử lý các câu hỏi liên quan đến đánh giá sản phẩm.
 * Chỉ expose 2 hàm public phục vụ actionHandler.
 *
 * Strategy hiệu năng:
 * - `getTopRatedProducts`: Đọc trực tiếp từ Products.ratingAvg (đã denormalize),
 *   KHÔNG JOIN Reviews → cực nhanh. Cache Redis 30 phút.
 * - `getProductReviewSummary`: Tìm Product by name + JOIN tối đa 3 comment mẫu.
 *   Không cache dài để tránh stale khi có review mới.
 */

const { Op } = require('sequelize');
const db = require('../models/index');
const redisHelper = require('../helpers/redis.helper');

// TTL 30 phút cho danh sách top-rated (dữ liệu ít thay đổi đột ngột)
const TOP_RATED_CACHE_TTL = 1800;

// Ngưỡng tối thiểu số lượng review để được xuất hiện
// (tránh SP 1 review 5 sao đè lên SP phổ biến hơn)
const MIN_REVIEW_COUNT = 3;

/**
 * Lấy danh sách sản phẩm được đánh giá cao nhất.
 *
 * @param {string|undefined} keyword - Lọc theo loại sản phẩm (tùy chọn)
 * @param {number} minRating - Ngưỡng rating tối thiểu (mặc định 4.0)
 * @param {number} limit - Số lượng sản phẩm trả về (mặc định 5)
 * @returns {{ EC: number, EM: string, DT: { products: Array } }}
 */
const getTopRatedProducts = async (keyword, minRating = 4.0, limit = 5) => {
    const safeKeyword = keyword ? keyword.trim().toLowerCase() : 'all';
    const safeMinRating = Math.min(Math.max(Number(minRating) || 4.0, 1), 5); // clamp [1,5]
    const safeLimit = Math.min(Math.max(Number(limit) || 5, 1), 20);          // clamp [1,20]

    const cacheKey = `chatbot:top-rated:${safeKeyword}:${safeMinRating}:${safeLimit}`;

    try {
        // 1. Thử lấy từ Cache trước
        const cached = await redisHelper.getCache(cacheKey);
        if (cached) {
            return { EC: 0, EM: 'Lấy top rated (Cache) thành công', DT: { products: cached } };
        }

        // 2. Build điều kiện WHERE
        const productWhere = {
            ratingAvg: { [Op.gte]: safeMinRating },
            reviewCount: { [Op.gte]: MIN_REVIEW_COUNT },
        };

        // Lọc thêm theo keyword (tên sản phẩm hoặc tên danh mục)
        if (safeKeyword !== 'all') {
            // Tìm các categoryId khớp với keyword trước để dùng IN clause (nhanh hơn LIKE JOIN)
            const matchedCategories = await db.Category.findAll({
                where: { name: { [Op.like]: `%${safeKeyword}%` } },
                attributes: ['id'],
                raw: true,
            });
            const categoryIds = matchedCategories.map(c => c.id);

            const nameOrCategoryConditions = [
                { name: { [Op.like]: `%${safeKeyword}%` } },
            ];
            if (categoryIds.length > 0) {
                nameOrCategoryConditions.push({ categoryId: { [Op.in]: categoryIds } });
            }
            productWhere[Op.and] = [{ [Op.or]: nameOrCategoryConditions }];
        }

        // 3. Query Products (đọc ratingAvg từ bảng Products — không JOIN Reviews)
        const products = await db.Product.findAll({
            where: productWhere,
            attributes: ['id', 'name', 'basePrice', 'discountPercent', 'ratingAvg', 'reviewCount'],
            order: [
                ['ratingAvg', 'DESC'],
                ['reviewCount', 'DESC'], // Tie-break: cùng rating → ưu tiên nhiều review hơn
            ],
            limit: safeLimit,
            include: [
                {
                    model: db.Category,
                    as: 'category',
                    attributes: ['name', 'slug'],
                },
                {
                    model: db.ProductImage,
                    as: 'images',
                    attributes: ['imageUrl', 'isMain'],
                    required: false,
                },
            ],
        });

        // 4. Tối ưu ảnh: chỉ giữ 1 ảnh chính + 1 ảnh phụ (giống các service khác)
        products.forEach(product => {
            if (product.images && product.images.length > 0) {
                const mainImg = product.images.find(img => img.isMain) || product.images[0];
                const secondImg = product.images.find(img => !img.isMain && img !== mainImg);
                const finalImages = [];
                if (mainImg) finalImages.push(mainImg);
                if (secondImg) finalImages.push(secondImg);
                product.dataValues.images = finalImages;
            }
        });

        // 5. Lưu cache (chỉ khi có kết quả — tránh cache empty array quá lâu)
        if (products.length > 0) {
            await redisHelper.setCache(cacheKey, products, TOP_RATED_CACHE_TTL);
        }

        return {
            EC: 0,
            EM: `Lấy ${products.length} sản phẩm top-rated thành công`,
            DT: { products },
        };

    } catch (error) {
        console.error('>>> Lỗi chatbot reviewService (getTopRatedProducts):', error);
        return {
            EC: -1,
            EM: 'Lỗi hệ thống khi lấy sản phẩm đánh giá cao',
            DT: { products: [] },
        };
    }
};

/**
 * Lấy tổng quan đánh giá cho một sản phẩm cụ thể (rating avg + sample comments).
 * Trả về product card để FE hiển thị + text summary để AI đọc.
 *
 * @param {string} productName - Tên sản phẩm khách muốn hỏi (dùng LIKE search)
 * @param {number} sampleLimit - Số comment mẫu trả về (mặc định 3)
 * @returns {{ EC: number, EM: string, DT: { product: Object|null, reviewSummary: Object|null } }}
 */
const getProductReviewSummary = async (productName, sampleLimit = 3) => {
    const safeName = productName ? productName.trim() : '';
    const safeSampleLimit = Math.min(Math.max(Number(sampleLimit) || 3, 1), 5);

    if (!safeName) {
        return {
            EC: 1,
            EM: 'Thiếu tên sản phẩm để tìm kiếm',
            DT: { product: null, reviewSummary: null },
        };
    }

    try {
        // 1. Tìm product phù hợp nhất (ưu tiên SP có nhiều review nhất nếu LIKE trả về nhiều kết quả)
        const product = await db.Product.findOne({
            where: {
                name: { [Op.like]: `%${safeName}%` },
            },
            attributes: ['id', 'name', 'basePrice', 'discountPercent', 'ratingAvg', 'reviewCount'],
            order: [['reviewCount', 'DESC']], // Tie-break: ưu tiên SP nổi tiếng hơn
            include: [
                { model: db.Category, as: 'category', attributes: ['name', 'slug'] },
                { model: db.ProductImage, as: 'images', attributes: ['imageUrl', 'isMain'], required: false },
            ],
        });

        // 2. Không tìm thấy sản phẩm
        if (!product) {
            return {
                EC: 0,
                EM: `Không tìm thấy sản phẩm nào có tên '${safeName}'`,
                DT: { product: null, reviewSummary: null },
            };
        }

        // 3. Tối ưu ảnh
        if (product.images && product.images.length > 0) {
            const mainImg = product.images.find(img => img.isMain) || product.images[0];
            product.dataValues.images = [mainImg];
        }

        // 4. Nếu sản phẩm chưa có review nào
        if (!product.reviewCount || product.reviewCount === 0) {
            return {
                EC: 0,
                EM: 'Tìm thấy sản phẩm nhưng chưa có đánh giá',
                DT: {
                    product,
                    reviewSummary: {
                        ratingAvg: 0,
                        reviewCount: 0,
                        sampleComments: [],
                    },
                },
            };
        }

        // 5. Lấy sample comments APPROVED gần nhất (JOIN tối thiểu — chỉ cần comment + rating)
        const recentReviews = await db.Review.findAll({
            where: {
                productId: product.id,
                status: 'APPROVED',
                comment: { [Op.not]: null, [Op.ne]: '' }, // Chỉ lấy review có nội dung
            },
            attributes: ['rating', 'comment', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: safeSampleLimit,
            include: [
                // Lấy tên người dùng để chatbot đọc tự nhiên hơn (ẩn nếu null = khách vãng lai)
                { model: db.User, as: 'user', attributes: ['fullName'], required: false },
            ],
        });

        // 6. Format comment mẫu để AI có thể đọc tự nhiên
        const sampleComments = recentReviews
            .filter(r => r.rating) // Guard: bỏ qua nếu rating null (edge case schema cũ)
            .map(r => ({
                rating: r.rating,
                comment: r.comment,
                reviewer: r.user?.fullName || 'Khách hàng',
            }));

        return {
            EC: 0,
            EM: 'Lấy tổng quan đánh giá sản phẩm thành công',
            DT: {
                product,
                reviewSummary: {
                    ratingAvg: Number(product.ratingAvg) || 0,
                    reviewCount: product.reviewCount || 0,
                    sampleComments,
                },
            },
        };

    } catch (error) {
        console.error('>>> Lỗi chatbot reviewService (getProductReviewSummary):', error);
        return {
            EC: -1,
            EM: 'Lỗi hệ thống khi lấy đánh giá sản phẩm',
            DT: { product: null, reviewSummary: null },
        };
    }
};

module.exports = {
    getTopRatedProducts,
    getProductReviewSummary,
};
