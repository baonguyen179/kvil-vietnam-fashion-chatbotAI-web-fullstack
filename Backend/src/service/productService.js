const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const cloudinary = require('cloudinary').v2;
const { Op } = require('sequelize');

const getAllProducts = async (queryParams) => {
    try {
        const page = parseInt(queryParams.page) || 1;
        const limit = parseInt(queryParams.limit) || 10;
        const offset = (page - 1) * limit;

        const categoryId = queryParams.categoryId;
        const sort = queryParams.sort;

        let whereCondition = {};

        if (categoryId) {
            whereCondition.categoryId = categoryId;
        }

        let orderCondition = [['createdAt', 'DESC']];
        if (sort === 'price_asc') {
            orderCondition = [['basePrice', 'ASC']];
        } else if (sort === 'price_desc') {
            orderCondition = [['basePrice', 'DESC']];
        } else if (sort === 'newest') {
            orderCondition = [['createdAt', 'DESC']];
        } else if (sort === 'oldest') {
            orderCondition = [['createdAt', 'ASC']];
        }

        const { count, rows } = await db.Product.findAndCountAll({
            where: whereCondition,
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
                    where: { isMain: true },
                    attributes: ['imageUrl'],
                    required: false
                }
            ],
            distinct: true
        });

        const totalPages = Math.ceil(count / limit);

        return {
            EM: 'Lấy danh sách sản phẩm thành công!',
            EC: errorCode.SUCCESS,
            DT: {
                totalItems: count,
                totalPages: totalPages,
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
                    [Op.substring]: keyword // Tìm kiếm chuỗi con (Giống LIKE '%keyword%' trong SQL)
                }
            },
            attributes: ['id', 'name', 'basePrice', 'discountPercent', 'createdAt'],
            include: [
                {
                    model: db.ProductImage,
                    as: 'images',
                    attributes: ['id', 'imageUrl', 'isMain'],
                    where: { isMain: true },
                    required: false
                }
            ],
            limit: +limit,
            offset: +offset,
            order: [['createdAt', 'DESC']] // Ưu tiên hiển thị sản phẩm mới tạo lên đầu
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