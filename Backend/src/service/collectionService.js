const db = require('../models/index');
const errorCode = require('../config/errorCodes');
const slugify = require('slugify');
const { Op } = require('sequelize');

const createCollection = async (data) => {
    try {
        const { name, description, bannerUrl, isActive } = data;

        // Tạo slug từ tên (VD: "Mùa Hè 2026" -> "mua-he-2026")
        const slug = slugify(name, { lower: true, locale: 'vi' });

        const isExist = await db.Collection.findOne({ where: { slug: slug } });
        if (isExist) {
            return { EM: 'Tên bộ sưu tập đã tồn tại!', EC: errorCode.VALIDATION_ERROR, DT: '' };
        }

        const newCollection = await db.Collection.create({
            name,
            description,
            bannerUrl,
            slug,
            isActive: isActive !== undefined ? isActive : true
        });

        return { EM: 'Tạo Bộ sưu tập thành công!', EC: errorCode.SUCCESS, DT: newCollection };

    } catch (error) {
        console.error(">>> Lỗi tại collectionService (createCollection):", error);
        return { EM: 'Lỗi server khi tạo Bộ sưu tập', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const getPublicCollections = async () => {
    try {
        const collections = await db.Collection.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']]
        });

        return { EM: 'Lấy danh sách Bộ sưu tập thành công!', EC: errorCode.SUCCESS, DT: collections };
    } catch (error) {
        console.error(">>> Lỗi tại collectionService (getPublicCollections):", error);
        return { EM: 'Lỗi server', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const getCollectionBySlug = async (slug) => {
    try {
        const collection = await db.Collection.findOne({
            where: { slug: slug, isActive: true },
            include: [
                {
                    model: db.Product,
                    as: 'products',
                    through: { attributes: [] },
                    attributes: ['id', 'name', 'basePrice', 'discountPercent'],
                    include: [
                        {
                            model: db.ProductImage,
                            as: 'images',
                            attributes: ['imageUrl'],
                            where: { isMain: true },
                            required: false
                        }
                    ]
                }
            ]
        });

        if (!collection) {
            return { EM: 'Không tìm thấy Bộ sưu tập!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        return { EM: 'Lấy chi tiết Bộ sưu tập thành công!', EC: errorCode.SUCCESS, DT: collection };
    } catch (error) {
        console.error(">>> Lỗi tại collectionService (getCollectionBySlug):", error);
        return { EM: 'Lỗi server', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const updateCollection = async (id, data) => {
    try {
        const collection = await db.Collection.findOne({ where: { id: id } });
        if (!collection) {
            return { EM: 'Không tìm thấy Bộ sưu tập!', EC: errorCode.NOT_FOUND, DT: '' };
        }

        if (data.name && data.name !== collection.name) {
            const newSlug = slugify(data.name, { lower: true, locale: 'vi' });

            const isExist = await db.Collection.findOne({
                where: { slug: newSlug }
            });

            if (isExist && isExist.id !== parseInt(id)) {
                return { EM: 'Tên bộ sưu tập này đã tồn tại!', EC: errorCode.VALIDATION_ERROR, DT: '' };
            }
            data.slug = newSlug;
        }

        await collection.update(data);

        return { EM: 'Cập nhật Bộ sưu tập thành công!', EC: errorCode.SUCCESS, DT: collection };

    } catch (error) {
        console.error(">>> Lỗi tại collectionService (updateCollection):", error);
        return { EM: 'Lỗi server khi cập nhật Bộ sưu tập', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const addProductsToCollection = async (collectionId, productIds) => {
    try {
        const collection = await db.Collection.findOne({ where: { id: collectionId } });
        if (!collection) return { EM: 'Không tìm thấy Bộ sưu tập!', EC: errorCode.NOT_FOUND, DT: '' };

        const existingProducts = await db.CollectionProduct.findAll({
            where: {
                collectionId: collectionId,
                productId: { [Op.in]: productIds }
            }
        });

        const existingIds = existingProducts.map(item => item.productId);

        const newIdsToInsert = productIds.filter(id => !existingIds.includes(id));

        if (newIdsToInsert.length > 0) {
            const dataToInsert = newIdsToInsert.map(productId => ({
                collectionId: collectionId,
                productId: productId
            }));
            await db.CollectionProduct.bulkCreate(dataToInsert);
        }

        return {
            EM: `Đã thêm ${newIdsToInsert.length} sản phẩm mới vào Bộ sưu tập! (Bỏ qua ${existingIds.length} sản phẩm đã có sẵn).`,
            EC: errorCode.SUCCESS,
            DT: ''
        };

    } catch (error) {
        console.error(">>> Lỗi (addProductsToCollection):", error);
        return { EM: 'Lỗi server khi thêm sản phẩm', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
const removeProductsFromCollection = async (collectionId, productIds) => {
    try {
        const collection = await db.Collection.findOne({ where: { id: collectionId } });
        if (!collection) return { EM: 'Không tìm thấy Bộ sưu tập!', EC: errorCode.NOT_FOUND, DT: '' };

        // Chỉ xóa những dòng có collectionId hiện tại VÀ nằm trong mảng productIds bị chỉ định
        await db.CollectionProduct.destroy({
            where: {
                collectionId: collectionId,
                productId: { [Op.in]: productIds }
            }
        });

        return { EM: 'Đã xóa các sản phẩm được chọn khỏi Bộ sưu tập!', EC: errorCode.SUCCESS, DT: '' };

    } catch (error) {
        console.error(">>> Lỗi (removeProductsFromCollection):", error);
        return { EM: 'Lỗi server khi xóa sản phẩm', EC: errorCode.OTHER_ERROR, DT: '' };
    }
}
module.exports = {
    createCollection,
    getPublicCollections,
    getCollectionBySlug,
    updateCollection,
    addProductsToCollection,
    removeProductsFromCollection
};