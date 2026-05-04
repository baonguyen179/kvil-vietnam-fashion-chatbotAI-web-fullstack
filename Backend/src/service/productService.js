const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const cloudinary = require('cloudinary').v2;
const { Op } = require('sequelize');
const aqp = require('api-query-params').default || require('api-query-params');
const redisHelper = require('../helpers/redis.helper');
const PRODUCT_CACHE_TTL = 3600;

const getAllProducts = async (queryParams) => {
    try {
        const cacheKey = `products:list:v2:${JSON.stringify(queryParams)}`;
        const cachedData = await redisHelper.getCache(cacheKey);
        if (cachedData) return { EM: 'Lấy danh sách sản phẩm (Cache) thành công!', EC: errorCode.SUCCESS, DT: cachedData };

        //  Tách các tham số cố định ra 
        const page = +queryParams.page || 1;
        const limit = +queryParams.limit || 10;
        const offset = (page - 1) * limit;
        const sort = queryParams.sort;

        // Xóa các tham số khỏi query để  cho AQP xử lý lọc
        const queryForAqp = { ...queryParams };
        delete queryForAqp.page;
        delete queryForAqp.limit;
        delete queryForAqp.sort;

        // AQP  parse các bộ lọc động (VD: basePrice>=100000&color=red)
        const { filter } = aqp(queryForAqp);

        let productWhere = {};
        let variantWhere = {};

        //  THUẬT TOÁN ADAPTER: Chuyển đổi cú pháp MongoDB của AQP sang Sequelize MySQL
        for (const key in filter) {
            let value = filter[key];

            // Nếu là phép so sánh (>=, <=, >, <)
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                const seqValue = {};
                for (const op in value) {
                    const seqOp = op.replace('$', ''); // Đổi $gte thành gte
                    if (Op[seqOp]) {
                        seqValue[Op[seqOp]] = value[op];
                    }
                }
                value = seqValue;
            }

            // Phân loại: Lọc theo Color/Size  Bảng ProductVariant, còn lại đẩy vào Bảng Product
            if (key === 'colorId' || key === 'sizeId') {
                variantWhere[key] = value;
            } else {
                productWhere[key] = value;
            }
        }

        //  Xử lý Sắp xếp 
        const sortOptions = {
            'price_asc': [['basePrice', 'ASC']],
            'price_desc': [['basePrice', 'DESC']],
            'newest': [['createdAt', 'DESC']],
            'oldest': [['createdAt', 'ASC']]
        };
        const orderCondition = sortOptions[sort] || [['createdAt', 'DESC']];

        // Truy vấn Database (Đã gắn thêm ProductVariant để lọc màu/size)
        const { count, rows } = await db.Product.findAndCountAll({
            where: productWhere,
            order: orderCondition,
            limit: limit,
            offset: offset,
            attributes: ['id', 'name', 'basePrice', 'discountPercent', 'ratingAvg', 'reviewCount', 'createdAt'],
            include: [
                {
                    model: db.Category,
                    as: 'category',
                    attributes: ['name', 'slug']
                },
                {
                    model: db.ProductImage,
                    as: 'images',
                    attributes: ['imageUrl', 'isMain'],
                    required: false
                },
                {
                    model: db.ProductVariant, // Bổ sung Join vào bảng Variant để lọc màu sắc/kích thước
                    as: 'variants',
                    attributes: ['id', 'stock', 'price', 'colorId', 'sizeId'],
                    where: Object.keys(variantWhere).length > 0 ? variantWhere : undefined,
                    required: Object.keys(variantWhere).length > 0, // Nếu có lọc màu/size thì bắt buộc phải INNER JOIN
                    include: [
                        { model: db.Color, as: 'color', attributes: ['id', 'name', 'hexCode'] },
                        { model: db.Size, as: 'size', attributes: ['id', 'name'] }
                    ]
                }

            ],
            distinct: true // Rất quan trọng khi dùng limit + include
        });

        //  Thuật toán lọc ảnh (O(M)): Lấy 1 ảnh chính + 1 ảnh phụ 
        rows.forEach(product => {
            if (product.images && product.images.length > 0) {
                let mainImg = null;
                let secondImg = null;

                for (const img of product.images) {
                    if (img.isMain && !mainImg) mainImg = img;
                    else if (!secondImg) secondImg = img;
                    if (mainImg && secondImg) break;
                }

                const finalImages = [];
                if (mainImg) finalImages.push(mainImg);
                if (secondImg) finalImages.push(secondImg);
                product.dataValues.images = finalImages;
            }
        });
        const result = {
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            products: rows
        };
        // Lưu Cache
        await redisHelper.setCache(cacheKey, result, PRODUCT_CACHE_TTL);

        return {
            EM: 'Lấy danh sách sản phẩm thành công!',
            EC: errorCode.SUCCESS,
            DT: result
        };

    } catch (error) {
        console.error(">>> Lỗi tại productService (getAllProducts):", error);
        return { EM: 'Lỗi server khi lấy sản phẩm', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const createProduct = async (productData) => {
    try {
        const { name, categoryId, basePrice, description, discountPercent } = productData;

        if (!name || !categoryId || !basePrice) {
            return {
                EM: 'Vui lòng điền đầy đủ Tên, Danh mục và Giá sản phẩm!',
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            };
        }
        const isExist = await db.Product.findOne({
            where: { name: name }
        });

        if (isExist) {
            return {
                EM: `Sản phẩm có tên "${name}" đã tồn tại trong hệ thống!`,
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            };
        }

        const category = await db.Category.findOne({
            where: { id: categoryId }
        });

        if (!category) {
            return {
                EM: 'Danh mục không tồn tại!',
                EC: errorCode.NOT_FOUND,
                DT: ''
            };
        }

        const newProduct = await db.Product.create({
            name: name,
            categoryId: categoryId,
            basePrice: basePrice,
            description: description || '',
            discountPercent: discountPercent || 0
        });
        //Xóa toàn bộ cache danh sách vì có SP mới làm thay đổi phân trang/lọc
        await Promise.all([
            redisHelper.delByPattern('products:list:*'),
            redisHelper.delByPattern('products:search:*')
        ]);
        return {
            EM: 'Tạo sản phẩm mới thành công!',
            EC: errorCode.SUCCESS,
            DT: newProduct
        };

    } catch (error) {
        console.error(">>> Lỗi tại productService (createProduct):", error);
        return { EM: 'Lỗi server khi tạo sản phẩm', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const updateProduct = async (productId, updateData) => {
    try {
        const { name, categoryId, basePrice, description, discountPercent } = updateData;

        const product = await db.Product.findOne({ where: { id: productId } });
        if (!product) {
            return { EM: 'Sản phẩm không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        if (name && name !== product.name) {
            const isExist = await db.Product.findOne({
                where: {
                    name: name,
                    id: { [Op.ne]: productId }
                }
            });
            if (isExist) {
                return { EM: `Tên sản phẩm "${name}" đã được sử dụng!`, EC: errorCode.VALIDATION_ERROR, DT: '' };
            }
        }

        await product.update({
            name: name || product.name,
            categoryId: categoryId || product.categoryId,
            basePrice: basePrice || product.basePrice,
            description: description || product.description,
            discountPercent: discountPercent !== undefined ? discountPercent : product.discountPercent
        });
        // Xóa cache chi tiết và toàn bộ danh sách
        await Promise.all([
            redisHelper.delCache(`product:detail:${productId}`),
            redisHelper.delByPattern('products:list:*'),
            redisHelper.delByPattern('products:search:*'),
            redisHelper.delByPattern('collection:detail:*')
        ]);

        return { EM: 'Cập nhật sản phẩm thành công!', EC: errorCode.SUCCESS, DT: product };

    } catch (error) {
        console.error(">>> Lỗi tại productService (updateProduct):", error);
        return { EM: 'Lỗi server khi cập nhật sản phẩm', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const deleteProduct = async (productId) => {
    try {
        const product = await db.Product.findOne({ where: { id: productId } });
        if (!product) {
            return { EM: 'Sản phẩm không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        // CHỈ CẦN GỌI HÀM NÀY: Sequelize sẽ tự động chuyển thành câu lệnh UPDATE deletedAt
        await product.destroy();

        await Promise.all([
            redisHelper.delCache(`product:detail:${productId}`),
            redisHelper.delByPattern('products:list:*'),
            redisHelper.delByPattern('collection:detail:*')
        ]);
        return { EM: 'Đã xóa mềm sản phẩm thành công!', EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        console.error(">>> Lỗi tại productService (deleteProduct):", error);
        return { EM: 'Lỗi server khi xóa sản phẩm', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const addProductVariant = async (productId, variantData) => {
    try {
        const { colorId, sizeId, stock, sku, price } = variantData;

        if (!colorId || !sizeId || stock === undefined || !sku) {
            return {
                EM: 'Vui lòng cung cấp đủ Màu sắc, Kích cỡ, Số lượng và mã SKU!',
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            };
        }

        const product = await db.Product.findOne({ where: { id: productId } });
        if (!product) {
            return {
                EM: 'Sản phẩm gốc không tồn tại!',
                EC: errorCode.NOT_FOUND,
                DT: ''
            };
        }

        const existingVariant = await db.ProductVariant.findOne({
            where: { productId: productId, colorId: colorId, sizeId: sizeId }
        });

        if (existingVariant) {
            return {
                EM: `Biến thể với Màu sắc và Kích cỡ này đã tồn tại!`,
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            };
        }

        const newVariant = await db.ProductVariant.create({
            productId: productId,
            colorId: colorId,
            sizeId: sizeId,
            stock: stock,
            sku: sku,
            price: price ? price : product.basePrice
        });

        // [NEW] Ghi log nhập hàng ban đầu
        await db.InventoryLog.create({
            variantId: newVariant.id,
            userId: null, // Admin thực hiện
            type: 'IN',
            quantity: stock,
            note: `Nhập kho ban đầu cho biến thể mới của SP ID: ${productId}`
        });

        await Promise.all([
            redisHelper.delCache(`product:detail:${productId}`),
            redisHelper.delByPattern('products:list:*'),
            redisHelper.delByPattern('collection:detail:*')
        ]);
        return {
            EM: 'Thêm biến thể sản phẩm thành công!',
            EC: errorCode.SUCCESS,
            DT: newVariant
        };

    } catch (error) {
        console.error(">>> Lỗi tại productService (addProductVariant):", error);
        return { EM: 'Lỗi server khi thêm biến thể', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}

const updateProductVariant = async (variantId, updateData) => {
    try {
        const variant = await db.ProductVariant.findOne({ where: { id: variantId } });
        if (!variant) {
            return { EM: 'Biến thể không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        const { colorId, sizeId, sku, price } = updateData;

        // Check unique constraint if color/size changed
        if ((colorId && colorId !== variant.colorId) || (sizeId && sizeId !== variant.sizeId)) {
            const checkColor = colorId || variant.colorId;
            const checkSize = sizeId || variant.sizeId;
            const existingVariant = await db.ProductVariant.findOne({
                where: { 
                    productId: variant.productId, 
                    colorId: checkColor, 
                    sizeId: checkSize,
                    id: { [Op.ne]: variantId }
                }
            });

            if (existingVariant) {
                return {
                    EM: `Biến thể với Màu sắc và Kích cỡ này đã tồn tại trong sản phẩm!`,
                    EC: errorCode.VALIDATION_ERROR,
                    DT: ''
                };
            }
        }

        await variant.update({
            colorId: colorId !== undefined ? colorId : variant.colorId,
            sizeId: sizeId !== undefined ? sizeId : variant.sizeId,
            sku: sku !== undefined ? sku : variant.sku,
            price: price !== undefined ? price : variant.price,
        });

        await Promise.all([
            redisHelper.delCache(`product:detail:${variant.productId}`),
            redisHelper.delByPattern('products:list:*'),
            redisHelper.delByPattern('collection:detail:*')
        ]);

        return {
            EM: 'Cập nhật biến thể thành công!',
            EC: errorCode.SUCCESS,
            DT: variant
        };

    } catch (error) {
        console.error(">>> Lỗi tại productService (updateProductVariant):", error);
        return { EM: 'Lỗi server khi cập nhật biến thể', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}

const addMultipleProductImages = async (productId, imagesDataInput) => {
    try {
        const product = await db.Product.findOne({ where: { id: productId } });
        if (!product) {
            return { EM: 'Sản phẩm không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        await db.ProductImage.update(
            { isMain: false },
            { where: { productId: productId } }
        );

        const imagesData = imagesDataInput.map((img, index) => {
            return {
                productId: productId,
                imageUrl: img.imageUrl,
                publicId: img.publicId,
                isMain: index === 0 ? true : false
            }
        });

        const newImages = await db.ProductImage.bulkCreate(imagesData);
        await Promise.all([
            redisHelper.delCache(`product:detail:${productId}`),
            redisHelper.delByPattern('products:list:*'),
            redisHelper.delByPattern('collection:detail:*')
        ]);
        return {
            EM: `Upload thành công ${imagesDataInput.length} ảnh!`,
            EC: errorCode.SUCCESS,
            DT: newImages
        };

    } catch (error) {
        console.error(">>> Lỗi tại productService:", error);
        return { EM: 'Lỗi server khi upload ảnh', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const deleteProductImage = async (imageId) => {
    try {
        const image = await db.ProductImage.findOne({
            where: { id: imageId }
        });

        if (!image) {
            return {
                EM: 'Ảnh không tồn tại hoặc đã bị xóa!',
                EC: errorCode.NOT_FOUND,
                DT: ''
            };
        }

        if (image.publicId) {
            const cloudResponse = await cloudinary.uploader.destroy(image.publicId);
            console.log(">>> Cloudinary Delete Response:", cloudResponse);
        }

        const productId = image.productId;
        await image.destroy();

        await Promise.all([
            redisHelper.delCache(`product:detail:${productId}`),
            redisHelper.delByPattern('products:list:*'),
            redisHelper.delByPattern('collection:detail:*')
        ]);

        return {
            EM: 'Xóa ảnh thành công!',
            EC: errorCode.SUCCESS,
            DT: ''
        };
    } catch (error) {
        console.error(">>> Lỗi tại productService (deleteProductImage):", error);
        return {
            EM: 'Lỗi server khi xóa ảnh',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        };
    }
}
const getProductById = async (productId) => {
    try {
        const cacheKey = `product:detail:v2:${productId}`;
        const cachedProduct = await redisHelper.getCache(cacheKey);
        if (cachedProduct) return { EM: 'Lấy chi tiết (Cache) thành công!', EC: errorCode.SUCCESS, DT: cachedProduct };

        const product = await db.Product.findOne({
            where: { id: productId },
            attributes: ['id', 'name', 'basePrice', 'discountPercent', 'description', 'ratingAvg', 'reviewCount', 'createdAt'],
            include: [
                {
                    model: db.Category,
                    as: 'category',
                    attributes: ['id', 'name', 'slug']
                },
                {
                    model: db.ProductImage,
                    as: 'images',
                    attributes: ['id', 'imageUrl', 'isMain']
                },
                {
                    model: db.ProductVariant,
                    as: 'variants',
                    attributes: ['id', 'stock', 'price', 'sku', 'colorId', 'sizeId'],
                    include: [
                        { model: db.Color, as: 'color', attributes: ['id', 'name', 'hexCode'] },
                        { model: db.Size, as: 'size', attributes: ['id', 'name'] }
                    ]
                }
            ],
            order: [
                [{ model: db.ProductImage, as: 'images' }, 'isMain', 'DESC']
            ]
        });

        if (!product) {
            return {
                EM: 'Không tìm thấy sản phẩm!',
                EC: errorCode.NOT_FOUND,
                DT: ''
            };
        }
        if (product) await redisHelper.setCache(cacheKey, product, PRODUCT_CACHE_TTL);
        return {
            EM: 'Lấy chi tiết sản phẩm thành công!',
            EC: errorCode.SUCCESS,
            DT: product
        };

    } catch (error) {
        console.error(">>> Lỗi tại productService (getProductById):", error);
        return {
            EM: 'Lỗi server khi lấy chi tiết sản phẩm',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        };
    }
}
const searchProducts = async (keyword, page = 1, limit = 10) => {
    try {
        // [SAFETY] Đảm bảo keyword là string và không trống
        const safeKeyword = (typeof keyword === 'string' ? keyword : '').trim();

        const cacheKey = `products:search:v2:${safeKeyword}:${page}:${limit}`;
        const cached = await redisHelper.getCache(cacheKey);
        if (cached) return { EM: `Tìm thấy (Cache) '${safeKeyword}'`, EC: errorCode.SUCCESS, DT: cached };

        if (!safeKeyword) {
            return {
                EM: 'Vui lòng nhập từ khóa tìm kiếm!',
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            };
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await db.Product.findAndCountAll({
            where: {
                name: {
                    [Op.substring]: keyword // Tìm kiếm chuỗi con
                }
            },
            attributes: ['id', 'name', 'basePrice', 'discountPercent', 'ratingAvg', 'reviewCount', 'createdAt'],
            include: [
                {
                    model: db.ProductImage,
                    as: 'images',
                    attributes: ['id', 'imageUrl', 'isMain'],
                    required: false
                },
                {
                    model: db.ProductVariant,
                    as: 'variants',
                    attributes: ['id', 'stock', 'price', 'colorId', 'sizeId'],
                    required: false,
                    include: [
                        { model: db.Color, as: 'color', attributes: ['id', 'name', 'hexCode'] },
                        { model: db.Size, as: 'size', attributes: ['id', 'name'] }
                    ]
                }

            ],
            limit: +limit,
            offset: +offset,
            order: [['createdAt', 'DESC']],
            distinct: true // (LƯU Ý QUAN TRỌNG) Bắt buộc phải có để count chính xác
        });

        // TỐI ƯU ĐỘ PHỨC TẠP: O(N * M) 
        rows.forEach(product => {
            if (product.images && product.images.length > 0) {
                let mainImg = null;
                let secondImg = null;

                // Duyệt mảng một lần duy nhất
                for (const img of product.images) {
                    if (img.isMain && !mainImg) {
                        mainImg = img;
                    } else if (!secondImg) {
                        secondImg = img;
                    }

                    // Dừng ngay khi tìm đủ 2 ảnh (Tiết kiệm vòng lặp)
                    if (mainImg && secondImg) break;
                }

                // Ghép mảng kết quả
                const finalImages = [];
                if (mainImg) finalImages.push(mainImg);
                if (secondImg) finalImages.push(secondImg);

                // Gán lại cho kết quả trả về
                product.dataValues.images = finalImages;
            }
        });

        const totalPages = Math.ceil(count / limit);

        const result = {
            totalItems: count,
            totalPages: totalPages,
            currentPage: +page,
            products: rows
        };
        await redisHelper.setCache(cacheKey, result, 1800); // Search cache ngắn hơn (30p)
        return {
            EM: `Tìm thấy ${count} sản phẩm khớp với từ khóa '${keyword}'`,
            EC: errorCode.SUCCESS,
            DT: result
        };

    } catch (error) {
        console.error(">>> Lỗi tại productService (searchProducts):", error);
        return {
            EM: 'Lỗi server khi tìm kiếm sản phẩm',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        };
    }
}
const getBestDiscountProducts = async (keyword, limit = 5) => {
    const cacheKey = `products:discount:${keyword || 'all'}:${limit}`;
    const cached = await redisHelper.getCache(cacheKey);
    if (cached) return { EM: "Lấy sản phẩm ưu đãi (Cache) thành công", EC: 0, DT: cached };

    let whereCondition = {
        discountPercent: {
            [Op.gt]: 0
        }
    };

    if (keyword) {
        whereCondition.name = {
            [Op.like]: `%${keyword}%`
        };
    }

    const products = await db.Product.findAll({
        where: whereCondition,
        order: [['discountPercent', 'DESC']],
        limit: limit
    });
    const result = { products };
    await redisHelper.setCache(cacheKey, result, 600); // Cache 10 phút 
    return {
        EM: "Lấy sản phẩm ưu đãi cao nhất thành công",
        EC: 0,
        DT: result
    };
};
const getBestSellerProducts = async (limit = 10) => {
    try {
        const cacheKey = `products:bestsellers:full:v2:${limit}`;
        const cachedProducts = await redisHelper.getCache(cacheKey);

        if (cachedProducts) {
            return {
                EM: "Lấy danh sách bestseller (Cache) thành công",
                EC: errorCode.SUCCESS,
                DT: { products: cachedProducts }
            };
        }

        // Lazy require để tránh vòng lặp phụ thuộc (Circular Dependency)
        const orderService = require('./orderService');
        // Lấy mảng ID bán chạy (Từ các đơn hàng)
        const productIds = await orderService.getBestSellerProductIds(limit) || [];

        let products = [];
        if (productIds.length > 0) {
            products = await db.Product.findAll({
                where: {
                    id: { [Op.in]: productIds }
                },
                attributes: ['id', 'name', 'basePrice', 'discountPercent', 'ratingAvg', 'reviewCount', 'createdAt'],
                include: [
                    {
                        model: db.Category,
                        as: 'category',
                        attributes: ['name', 'slug']
                    },
                    {
                        model: db.ProductImage,
                        as: 'images',
                        attributes: ['imageUrl', 'isMain'],
                        required: false
                    },
                    {
                        model: db.ProductVariant,
                        as: 'variants',
                        attributes: ['id', 'stock', 'price', 'colorId', 'sizeId'],
                        required: false,
                        include: [
                            { model: db.Color, as: 'color', attributes: ['id', 'name', 'hexCode'] },
                            { model: db.Size, as: 'size', attributes: ['id', 'name'] }
                        ]
                    }

                ],
                distinct: true
            });

            // Sắp xếp lại phần bestseller theo thứ tự IDs trả về từ orderService
            const idIndexMap = new Map(productIds.map((id, index) => [id, index]));
            products.sort((a, b) => idIndexMap.get(a.id) - idIndexMap.get(b.id));
        }

        // CƠ CHẾ FALLBACK: Nếu không đủ sản phẩm bán chạy, lấy thêm sản phẩm mới nhất để điền đầy limit
        const needed = limit - products.length;
        if (needed > 0) {
            const currentIds = products.map(p => p.id);
            const additionalProducts = await db.Product.findAll({
                where: {
                    id: { [Op.notIn]: currentIds }
                },
                attributes: ['id', 'name', 'basePrice', 'discountPercent', 'ratingAvg', 'reviewCount', 'createdAt'],
                include: [
                    {
                        model: db.Category,
                        as: 'category',
                        attributes: ['name', 'slug']
                    },
                    {
                        model: db.ProductImage,
                        as: 'images',
                        attributes: ['imageUrl', 'isMain'],
                        required: false
                    },
                    {
                        model: db.ProductVariant,
                        as: 'variants',
                        attributes: ['id', 'stock', 'price', 'colorId', 'sizeId'],
                        required: false,
                        include: [
                            { model: db.Color, as: 'color', attributes: ['id', 'name', 'hexCode'] },
                            { model: db.Size, as: 'size', attributes: ['id', 'name'] }
                        ]
                    }

                ],
                order: [['createdAt', 'DESC']], // Ưu tiên hàng mới
                limit: needed,
                distinct: true
            });
            products = [...products, ...additionalProducts];
        }

        // Tối ưu ảnh cho toàn bộ danh sách (Bestseller + Newest)
        products.forEach(product => {
            if (product.images && product.images.length > 0) {
                let mainImg = null;
                let secondImg = null;

                for (const img of product.images) {
                    if (img.isMain && !mainImg) mainImg = img;
                    else if (!secondImg) secondImg = img;
                    if (mainImg && secondImg) break;
                }

                const finalImages = [];
                if (mainImg) finalImages.push(mainImg);
                if (secondImg) finalImages.push(secondImg);
                product.dataValues.images = finalImages;
            }
        });

        // Lưu cache (TTL 1 giờ)
        await redisHelper.setCache(cacheKey, products, PRODUCT_CACHE_TTL);

        return {
            EM: "Lấy danh sách bestseller thành công",
            EC: errorCode.SUCCESS,
            DT: { products }
        };

    } catch (e) {
        console.error(">>> Lỗi getBestSellerProducts:", e);
        return {
            EM: "Lỗi bestseller",
            EC: errorCode.OTHER_ERROR,
            DT: { products: [] }
        };
    }
};
const checkProductAvailability = async (keyword, size, color) => {
    try {
        let sizeWhere = undefined;
        let colorWhere = undefined;
        if (size) sizeWhere = { name: { [Op.like]: `%${size}%` } };
        if (color) colorWhere = { name: { [Op.like]: `%${color}%` } };

        const variants = await db.ProductVariant.findAll({
            include: [
                {
                    model: db.Product,
                    as: "product",
                    where: {
                        name: {
                            [Op.like]: `%${keyword}%`
                        }
                    }
                },
                {
                    model: db.Size,
                    as: 'size',
                    where: sizeWhere,
                    required: !!sizeWhere
                },
                {
                    model: db.Color,
                    as: 'color',
                    where: colorWhere,
                    required: !!colorWhere
                }
            ]
        });

        if (!variants.length) {
            return {
                DT: { available: false, message: "Không tìm thấy sản phẩm" }
            };
        }

        const available = variants.some(v => v.stock > 0);

        return {
            DT: {
                available,
                variants
            }
        };

    } catch (e) {
        console.error(e);
        return {
            DT: { available: false }
        };
    }
};
const filterProductsAdvanced = async (keyword, minPrice, maxPrice, limit = 5) => {
    try {
        const cacheKey = `products:filter:adv:${keyword}:${minPrice}:${maxPrice}:${limit}`;
        const cached = await redisHelper.getCache(cacheKey);
        if (cached) return { EM: "OK (Cache)", EC: 0, DT: cached };
        const productWhere = {};
        const variantWhere = {};

        // lọc theo tên
        if (keyword) {
            productWhere.name = {
                [Op.like]: `%${keyword}%`
            };
        }

        // lọc theo giá
        if (minPrice && maxPrice) {
            variantWhere.price = {
                [Op.between]: [minPrice, maxPrice]
            };
        } else if (minPrice) {
            variantWhere.price = {
                [Op.gte]: minPrice
            };
        } else if (maxPrice) {
            variantWhere.price = {
                [Op.lte]: maxPrice
            };
        }

        // chỉ lấy còn hàng
        variantWhere.stock = {
            [Op.gt]: 0
        };

        const products = await db.Product.findAll({
            where: productWhere,
            include: [
                {
                    model: db.ProductVariant,
                    as: "variants",
                    where: variantWhere
                }
            ],
            limit: limit
        });

        const result = { products };
        await redisHelper.setCache(cacheKey, result, 600);
        return { EM: "OK", EC: 0, DT: result };

    } catch (e) {
        console.error(e);
        return {
            EM: "Lỗi filter advanced",
            EC: -1,
            DT: { products: [] }
        };
    }
};
const getInventoryLogs = async (query) => {
    try {
        const { page, limit, variantId, type, startDate, endDate } = query;
        const cacheKey = `product:inventory:logs:${JSON.stringify(query)}`;
        const cached = await redisHelper.getCache(cacheKey);
        if (cached) return { EM: 'Lấy lịch sử kho hàng (Cache) thành công', EC: errorCode.SUCCESS, DT: cached };

        const offset = (page - 1) * limit;

        const whereCondition = {};
        if (variantId) whereCondition.variantId = variantId;
        if (type) whereCondition.type = type;

        if (startDate || endDate) {
            whereCondition.createdAt = {};
            if (startDate) whereCondition.createdAt[Op.gte] = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                whereCondition.createdAt[Op.lte] = end;
            }
        }

        const { count, rows } = await db.InventoryLog.findAndCountAll({
            where: whereCondition,
            offset: offset,
            limit: limit,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: db.ProductVariant,
                    as: 'variant',
                    attributes: ['sku', 'productId'],
                    include: [{ model: db.Product, as: 'product', attributes: ['name'] }]
                },
                { model: db.User, as: 'user', attributes: ['fullName', 'email'] }
            ]
        });

        const totalPages = Math.ceil(count / limit);
        const result = {
            totalRows: count,
            totalPages: totalPages,
            logs: rows
        };

        await redisHelper.setCache(cacheKey, result, 600); // Cache 10 phút

        return {
            EM: 'Lấy lịch sử kho hàng thành công',
            EC: errorCode.SUCCESS,
            DT: result
        };
    } catch (error) {
        console.error(">>> Lỗi getInventoryLogs:", error);
        return { EM: 'Lỗi server khi lấy lịch sử kho hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

/**
 * [SENIOR] Điều chỉnh kho theo nguyên tắc "Bút toán đảo" (Compensating Transaction).
 * TUYỆT ĐỐI KHÔNG XÓA log cũ - chỉ tạo log mới type ADJUST để bù trừ.
 * @param {number} variantId - ID biến thể cần điều chỉnh
 * @param {number} delta - Số lượng thay đổi (có thể âm hoặc dương)
 * @param {string} note - Lý do điều chỉnh bắt buộc ghi rõ
 * @param {number} adminId - ID admin thực hiện
 */
const adjustInventory = async (variantId, delta, note, adminId) => {
    let t;
    try {
        t = await db.sequelize.transaction();

        const variant = await db.ProductVariant.findOne({
            where: { id: variantId },
            include: [{ model: db.Product, as: 'product', attributes: ['id', 'name'] }],
            transaction: t,
            lock: true // Lock row để tránh Race Condition
        });

        if (!variant) {
            await t.rollback();
            return { EM: 'Biến thể sản phẩm không tồn tại!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        const newStock = variant.stock + delta;

        // Guard: Không cho phép tồn kho về số âm
        if (newStock < 0) {
            await t.rollback();
            return {
                EM: `Không thể điều chỉnh! Tồn kho hiện tại là ${variant.stock}, điều chỉnh ${delta} sẽ làm kho về ${newStock} (âm).`,
                EC: errorCode.VALIDATION_ERROR,
                DT: { currentStock: variant.stock }
            };
        }

        // Cập nhật tồn kho trong 1 transaction an toàn
        await variant.update({ stock: newStock }, { transaction: t });

        // Ghi log ADJUST - không bao giờ xóa log cũ
        await db.InventoryLog.create({
            variantId: variant.id,
            userId: adminId,
            type: 'ADJUST',
            quantity: Math.abs(delta),
            note: `[${delta > 0 ? 'TĂNG' : 'GIẢM'} ${Math.abs(delta)}] ${note}`
        }, { transaction: t });

        await t.commit();

        // Xóa cache liên quan
        await Promise.all([
            redisHelper.delByPattern('product:inventory:logs:*'),
            redisHelper.delCache(`product:detail:${variant.product?.id || variant.productId}`),
            redisHelper.delByPattern('products:list:*')
        ]);

        return {
            EM: `Điều chỉnh kho thành công! Tồn kho SKU ${variant.sku}: ${variant.stock} → ${newStock}`,
            EC: errorCode.SUCCESS,
            DT: { previousStock: variant.stock, newStock, delta }
        };

    } catch (error) {
        if (t) await t.rollback();
        console.error(">>> Lỗi adjustInventory:", error);
        return { EM: 'Lỗi server khi điều chỉnh kho hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

const importInventory = async (fileBuffer, adminId) => {
    let t;
    try {
        const excelHelper = require('../helpers/excel.helper');
        
        // 1. Đọc và lấy data từ Excel
        const data = await excelHelper.parseExcelBuffer(fileBuffer);
        if (!data || data.length === 0) {
            return { EM: 'File Excel trống hoặc không đúng định dạng mẫu.', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }
        if (data.length > 1000) {
            return { EM: 'File quá lớn. Vui lòng upload tối đa 1000 dòng mỗi lần.', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        // 2. Lấy toàn bộ mã SKU từ DB để kiểm tra (Tối ưu performance: O(1) Lookup)
        const skusInExcel = data.map(item => item.sku);
        const variantsInDb = await db.ProductVariant.findAll({
            where: { sku: { [Op.in]: skusInExcel } },
            attributes: ['id', 'sku', 'stock', 'productId']
        });

        const variantMap = new Map();
        variantsInDb.forEach(v => variantMap.set(v.sku, v));

        // 3. Validation: Option A (All-or-Nothing) - Bắt lỗi tất cả các dòng sai
        const errors = [];
        data.forEach(item => {
            if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
                errors.push(`Dòng ${item.rowNumber}: Số lượng nhập (${item.quantity}) không hợp lệ.`);
            }
            if (!variantMap.has(item.sku)) {
                errors.push(`Dòng ${item.rowNumber}: Mã SKU '${item.sku}' không tồn tại trong hệ thống.`);
            }
        });

        if (errors.length > 0) {
            return { 
                EM: 'Dữ liệu không hợp lệ. Vui lòng sửa lại file Excel.', 
                EC: errorCode.VALIDATION_ERROR, 
                DT: { errors } // Trả về mảng lỗi để hiển thị ở Frontend
            };
        }

        // 4. Mở Transaction: Update kho và Ghi Log an toàn
        t = await db.sequelize.transaction();

        const logTasks = [];
        const updateTasks = [];
        const updatedProductIds = new Set(); // Dùng để xóa cache

        for (const item of data) {
            const variant = variantMap.get(item.sku);
            
            // Increment an toàn với Transaction, tự động lock row (Race Condition Prevention)
            updateTasks.push(variant.increment('stock', { by: item.quantity, transaction: t }));
            updatedProductIds.add(variant.productId);

            // Gom array để bulkCreate
            logTasks.push({
                variantId: variant.id,
                userId: adminId,
                type: 'IN', // Option: Cộng dồn
                quantity: item.quantity,
                note: `Nhập kho hàng loạt qua file Excel.`
            });
        }

        await Promise.all(updateTasks);
        await db.InventoryLog.bulkCreate(logTasks, { transaction: t });

        await t.commit();

        // 5. Xóa Cache (Batching Cache Invalidation)
        const cacheTasks = [
            redisHelper.delByPattern('product:inventory:logs:*'),
            redisHelper.delByPattern('products:list:*'),
            redisHelper.delByPattern('products:search:*'),
            redisHelper.delByPattern('collection:detail:*')
        ];
        // Xóa cache chi tiết của từng sản phẩm bị ảnh hưởng
        updatedProductIds.forEach(pid => {
            cacheTasks.push(redisHelper.delCache(`product:detail:${pid}`));
        });
        
        await Promise.all(cacheTasks);

        return {
            EM: `Nhập kho thành công ${data.length} dòng!`,
            EC: errorCode.SUCCESS,
            DT: { successCount: data.length }
        };

    } catch (error) {
        if (t) await t.rollback();
        console.error(">>> Lỗi importInventory:", error);
        return { EM: error.message || 'Lỗi hệ thống khi import kho hàng', EC: errorCode.OTHER_ERROR, DT: '' };
    }
};

module.exports = {
    getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, searchProducts,
    addProductVariant, updateProductVariant,
    addMultipleProductImages, deleteProductImage, getBestDiscountProducts,
    getBestSellerProducts, checkProductAvailability, filterProductsAdvanced, getInventoryLogs,
    importInventory, adjustInventory
}