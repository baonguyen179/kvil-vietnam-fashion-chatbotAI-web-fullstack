const sizeService = require('../service/sizeService');

const handleGetAllSizes = async (req, res) => {
    try {
        const data = await sizeService.getAllSizes();
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ EM: 'Lỗi server', EC: -1, DT: '' });
    }
};

const handleCreateSize = async (req, res) => {
    try {
        const data = await sizeService.createSize(req.body);
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ EM: 'Lỗi server', EC: -1, DT: '' });
    }
};

const handleUpdateSize = async (req, res) => {
    try {
        const data = await sizeService.updateSize(req.params.id, req.body);
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ EM: 'Lỗi server', EC: -1, DT: '' });
    }
};

const handleDeleteSize = async (req, res) => {
    try {
        const data = await sizeService.deleteSize(req.params.id);
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ EM: 'Lỗi server', EC: -1, DT: '' });
    }
};

module.exports = {
    handleGetAllSizes, handleCreateSize, handleUpdateSize, handleDeleteSize
};
