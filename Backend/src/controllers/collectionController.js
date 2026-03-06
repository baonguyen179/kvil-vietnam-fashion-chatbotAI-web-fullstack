const collectionService = require('../service/collectionService');
const collectionValidation = require('../validations/collectionValidation');
const errorCode = require('../config/errorCodes');

const handleCreateCollection = async (req, res) => {
    try {
        const { error } = collectionValidation.createCollectionSchema.validate(req.body);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        let bannerUrl = null;
        if (req.file) {
            bannerUrl = req.file.path;
        }

        const collectionData = {
            name: req.body.name,
            description: req.body.description,
            isActive: req.body.isActive,
            bannerUrl: bannerUrl
        };

        const data = await collectionService.createCollection(collectionData);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleCreateCollection):", error);
        return res.status(500).json({ EM: 'Lỗi server', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleGetPublicCollections = async (req, res) => {
    try {
        const data = await collectionService.getPublicCollections();
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        return res.status(500).json({ EM: 'Lỗi server', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleGetCollectionBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const data = await collectionService.getCollectionBySlug(slug);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        return res.status(500).json({ EM: 'Lỗi server', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleUpdateCollection = async (req, res) => {
    try {
        const id = req.params.id;

        const { error } = collectionValidation.updateCollectionSchema.validate(req.body);
        if (error) {
            return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });
        }

        let updateData = {
            name: req.body.name,
            description: req.body.description,
            isActive: req.body.isActive
        };

        if (req.file) {
            updateData.bannerUrl = req.file.path;
        }

        const data = await collectionService.updateCollection(id, updateData);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });

    } catch (error) {
        console.error(">>> Lỗi controller (handleUpdateCollection):", error);
        return res.status(500).json({ EM: 'Lỗi server', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleAddProductsToCollection = async (req, res) => {
    try {
        const collectionId = req.params.id;
        const { error } = collectionValidation.addProductsToCollectionSchema.validate(req.body);
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await collectionService.addProductsToCollection(collectionId, req.body.productIds);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        return res.status(500).json({ EM: 'Lỗi server', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
const handleRemoveProductsFromCollection = async (req, res) => {
    try {
        const collectionId = req.params.id;
        const { error } = collectionValidation.addProductsToCollectionSchema.validate(req.body);
        if (error) return res.status(200).json({ EM: error.details[0].message, EC: errorCode.VALIDATION_ERROR, DT: '' });

        const data = await collectionService.removeProductsFromCollection(collectionId, req.body.productIds);
        return res.status(200).json({ EM: data.EM, EC: data.EC, DT: data.DT });
    } catch (error) {
        return res.status(500).json({ EM: 'Lỗi server', EC: errorCode.OTHER_ERROR, DT: '' });
    }
}
module.exports = {
    handleCreateCollection,
    handleGetCollectionBySlug,
    handleGetPublicCollections,
    handleUpdateCollection,
    handleAddProductsToCollection,
    handleRemoveProductsFromCollection
}