const productService = require('../service/productService');
const errorCode = require('../config/errorCodes');

const handleGetAllProducts = async (req, res) => {
    try {
        const queryParams = req.query;

        const data = await productService.getAllProducts(queryParams);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi controller (handleGetAllProducts):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
const handleGetProductById = async (req, res) => {
    try {
        const { error } = productValidation.productIdSchema.validate({ id: req.params.id });
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await productService.getProductById(req.params.id);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetProductById):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleCreateProduct = async (req, res) => {
    try {
        const { error, value } = productValidation.productBodySchema.validate(req.body);
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await productService.createProduct(value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleCreateProduct):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleUpdateProduct = async (req, res) => {
    try {
        const { error: idError } = productValidation.productIdSchema.validate({ id: req.params.id });
        if (idError) return res.status(200).json({ EM: idError.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const { error: bodyError, value } = productValidation.productBodySchema.validate(req.body);
        if (bodyError) return res.status(200).json({ EM: bodyError.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await productService.updateProduct(req.params.id, value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleUpdateProduct):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleDeleteProduct = async (req, res) => {
    try {
        const { error } = productValidation.productIdSchema.validate({ id: req.params.id });
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await productService.deleteProduct(req.params.id);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleDeleteProduct):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleAddProductVariant = async (req, res) => {
    try {
        const { error } = productValidation.productIdSchema.validate({ id: req.params.id });
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await productService.addProductVariant(req.params.id, req.body);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleAddProductVariant):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleAddProductImages = async (req, res) => {
    try {
        const { error } = productValidation.productIdSchema.validate({ id: req.params.id });
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(200).json({ EM: 'Chưa chọn file ảnh nào!', EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const imagesDataInput = files.map(file => {
            return {
                imageUrl: file.path,
                publicId: file.filename
            }
        });

        const data = await productService.addMultipleProductImages(req.params.id, imagesDataInput);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleDeleteProductImage = async (req, res) => {
    try {
        const { error } = productValidation.imageIdSchema.validate({ imageId: req.params.imageId });
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await productService.deleteProductImage(req.params.imageId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleDeleteProductImage):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleSearchProducts = async (req, res) => {
    try {
        const { error, value } = productValidation.searchSchema.validate(req.query);
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await productService.searchProducts(value.keyword, value.page, value.limit);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleSearchProducts):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
module.exports = {
    handleGetAllProducts, handleCreateProduct, handleUpdateProduct, handleDeleteProduct,
    handleGetProductById, handleSearchProducts,
    handleAddProductVariant,
    handleAddProductImages, handleDeleteProductImage
}