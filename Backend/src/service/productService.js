const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const cloudinary = require('cloudinary').v2;
const { Op } = require('sequelize');
const aqp = require('api-query-params').default || require('api-query-params');

const getAllProducts = async (queryParams) => {
    try {
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
            if (key === 'color' || key === 'size') {
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
            attributes: ['id', 'name', 'basePrice', 'discountPercent', 'createdAt'],
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
                    attributes: [], // Không cần in ra dữ liệu của variant, chỉ dùng để lọc (tiết kiệm băng thông)
                    where: Object.keys(variantWhere).length > 0 ? variantWhere : undefined,
                    required: Object.keys(variantWhere).length > 0 // Nếu có lọc màu/size thì bắt buộc phải INNER JOIN
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

        return {
            EM: 'Lấy danh sách sản phẩm thành công!',
            EC: errorCode.SUCCESS,
            DT: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                products: rows
            }
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

        return { EM: 'Đã xóa mềm sản phẩm thành công!', EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        console.error(">>> Lỗi tại productService (deleteProduct):", error);
        return { EM: 'Lỗi server khi xóa sản phẩm', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const addProductVariant = async (productId, variantData) => {
    try {
        const { color, size, stock, sku, price } = variantData;

        if (!color || !size || stock === undefined) {
            return {
                EM: 'Vui lòng cung cấp đủ Màu sắc, Kích cỡ và Số lượng tồn kho!',
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
            where: { productId: productId, color: color, size: size }
        });

        if (existingVariant) {
            return {
                EM: `Biến thể Màu ${color} - Size ${size} đã tồn tại!`,
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            };
        }

        let finalSku = sku;

        if (!finalSku) {
            const variantCount = await db.ProductVariant.count({
                where: { productId: productId }
            });

            const parentCode = parseInt(productId);

            const variantSuffix = variantCount + 1;

            finalSku = `${parentCode}-${variantSuffix}`;
        }

        const newVariant = await db.ProductVariant.create({
            productId: productId,
            color: color,
            size: size,
            stock: stock,
            sku: finalSku,
            price: price ? price : product.basePrice
        });

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

        await image.destroy();

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
        const product = await db.Product.findOne({
            where: { id: productId },
            attributes: ['id', 'name', 'basePrice', 'discountPercent', 'description', 'createdAt'],
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
                    attributes: ['id', 'color', 'size', 'stock', 'price', 'sku']
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
        if (!keyword) {
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
            attributes: ['id', 'name', 'basePrice', 'discountPercent', 'createdAt'],
            include: [
                {
                    model: db.ProductImage,
                    as: 'images',
                    attributes: ['id', 'imageUrl', 'isMain'],
                    required: false
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

        return {
            EM: `Tìm thấy ${count} sản phẩm khớp với từ khóa '${keyword}'`,
            EC: errorCode.SUCCESS,
            DT: {
                totalItems: count,
                totalPages: totalPages,
                currentPage: +page,
                products: rows
            }
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
module.exports = {
    getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, searchProducts,
    addProductVariant,
    addMultipleProductImages, deleteProductImage,
}