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
        const productId = req.params.id;

        if (!productId) {
            return res.status(200).json({
                EM: 'Thiếu ID sản phẩm!',
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            });
        }

        const data = await productService.getProductById(productId);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi controller (handleGetProductById):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
const handleCreateProduct = async (req, res) => {
    try {
        const data = await productService.createProduct(req.body);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi controller (handleCreateProduct):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
const handleUpdateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(200).json({ EM: 'Thiếu ID sản phẩm!', EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await productService.updateProduct(productId, req.body);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleUpdateProduct):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleDeleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(200).json({ EM: 'Thiếu ID sản phẩm!', EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const data = await productService.deleteProduct(productId);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        console.error(">>> Lỗi controller (handleDeleteProduct):", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleAddProductVariant = async (req, res) => {
    try {
        const productId = req.params.id;

        if (!productId) {
            return res.status(200).json({
                EM: 'Thiếu ID sản phẩm!',
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            });
        }

        const data = await productService.addProductVariant(productId, req.body);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi controller (handleAddProductVariant):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
const handleAddProductImages = async (req, res) => {
    try {
        const productId = req.params.id;
        const files = req.files;

        if (!productId) {
            return res.status(200).json({ EM: 'Thiếu ID sản phẩm!', EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        if (!files || files.length === 0) {
            return res.status(200).json({ EM: 'Chưa chọn file ảnh nào!', EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        const imagesDataInput = files.map(file => {
            return {
                imageUrl: file.path,
                publicId: file.filename
            }
        });

        const data = await productService.addMultipleProductImages(productId, imagesDataInput);

        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller:", error);
        return res.status(500).json({ EM: 'Lỗi server nội bộ', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleDeleteProductImage = async (req, res) => {
    try {
        const imageId = req.params.imageId;

        if (!imageId) {
            return res.status(200).json({
                EM: 'Thiếu ID của ảnh cần xóa!',
                EC: errorCode.VALIDATION_ERROR,
                DT: ''
            });
        }

        const data = await productService.deleteProductImage(imageId);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi controller (handleDeleteProductImage):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
const handleSearchProducts = async (req, res) => {
    try {
        const { keyword, page, limit } = req.query;

        const data = await productService.searchProducts(keyword, page, limit);

        return res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT
        });

    } catch (error) {
        console.error(">>> Lỗi controller (handleSearchProducts):", error);
        return res.status(500).json({
            EM: 'Lỗi server nội bộ',
            EC: errorCode.OTHER_ERROR,
            DT: ''
        });
    }
}
module.exports = {
    handleGetAllProducts, handleCreateProduct, handleUpdateProduct, handleDeleteProduct,
    handleGetProductById, handleSearchProducts,
    handleAddProductVariant,
    handleAddProductImages, handleDeleteProductImage
}