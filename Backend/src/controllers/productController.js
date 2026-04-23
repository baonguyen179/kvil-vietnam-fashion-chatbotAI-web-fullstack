const productService = require('../service/productService');
const errorCode = require('../config/errorCodes');
const productValidation = require('../validations/productValidation');
const { decodeId } = require('../utils/idHasher');

const handleGetAllProducts = async (req, res) => {
    try {
        const { error, value } = productValidation.getAllProductsSchema.validate(req.query);

        if (error) {
            return res.status(200).json({
                EM: error.details[0].message,
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            });
        }

        const data = await productService.getAllProducts(value);

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
};
const handleGetProductById = async (req, res) => {
    try {
        const { error } = productValidation.productIdSchema.validate({ id: req.params.id });
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const rawId = req.params.id;
        const decodedId = decodeId(rawId);
        
        // Sử dụng decodedId nếu giải mã thành công (không null), ngược lại dùng rawId (ID cũ)
        const targetId = (decodedId !== null && decodedId !== undefined) ? decodedId : rawId;
        
        console.log(`>>> Fetching product with ID: ${targetId} (Raw: ${rawId})`);
        
        const data = await productService.getProductById(targetId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetProductById):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};
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
};

const handleUpdateProduct = async (req, res) => {
    try {
        const { error: idError } = productValidation.productIdSchema.validate({ id: req.params.id });
        if (idError) return res.status(200).json({ EM: idError.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const { error: bodyError, value } = productValidation.productBodySchema.validate(req.body);
        if (bodyError) return res.status(200).json({ EM: bodyError.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const rawId = req.params.id;
        const decodedId = decodeId(rawId);

        const data = await productService.updateProduct(decodedId || rawId, value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleUpdateProduct):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleDeleteProduct = async (req, res) => {
    try {
        const { error } = productValidation.productIdSchema.validate({ id: req.params.id });
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const rawId = req.params.id;
        const decodedId = decodeId(rawId);

        const data = await productService.deleteProduct(decodedId || rawId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleDeleteProduct):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleAddProductVariant = async (req, res) => {
    try {
        const { error } = productValidation.productIdSchema.validate({ id: req.params.id });
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const { error: variantError } = productValidation.variantSchema.validate(req.body);
        if (variantError) return res.status(200).json({ EM: variantError.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const rawId = req.params.id;
        const decodedId = decodeId(rawId);

        const data = await productService.addProductVariant(decodedId || rawId, req.body);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleAddProductVariant):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

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
};

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
};

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
};

const handleGetBestSellerProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const data = await productService.getBestSellerProducts(limit);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });
    } catch (error) {
        console.error(">>> Lỗi controller (handleGetBestSellerProducts):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
};

const handleGetInventoryLogs = async (req, res) => {
    try {
        const { error, value } = productValidation.getInventoryLogsSchema.validate(req.query);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await productService.getInventoryLogs(value);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi handleGetInventoryLogs:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleImportInventory = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(200).json({ EM: 'Vui lòng chọn file Excel để tải lên!', EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const adminId = req.user?.id || null;
        const fileBuffer = req.file.buffer;

        const data = await productService.importInventory(fileBuffer, adminId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi handleImportInventory:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

const handleGetInventoryTemplate = async (req, res) => {
    try {
        const excelHelper = require('../helpers/excel.helper');
        const buffer = await excelHelper.generateTemplateBuffer();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Mau_Nhap_Kho.xlsx');
        
        return res.status(200).send(buffer);
    } catch (error) {
        console.error(">>> Lỗi handleGetInventoryTemplate:", error);
        return res.status(500).json({ EM: 'Lỗi server khi tạo file mẫu', EC: errorCode.OTHER_ERROR, DT: '' });
    }
};

module.exports = {
    handleGetAllProducts, handleCreateProduct, handleUpdateProduct, handleDeleteProduct,
    handleGetProductById, handleSearchProducts,
    handleAddProductVariant,
    handleAddProductImages, handleDeleteProductImage,
    handleGetBestSellerProducts,
    handleGetInventoryLogs,
    handleImportInventory,
    handleGetInventoryTemplate
}