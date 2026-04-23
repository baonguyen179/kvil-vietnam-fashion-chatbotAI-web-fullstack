const colorService = require('../service/colorService');

const handleGetAllColors = async (req, res) => {
    try {
        const data = await colorService.getAllColors();
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ EM: 'Lỗi server', EC: -1, DT: '' });
    }
};

const handleCreateColor = async (req, res) => {
    try {
        const data = await colorService.createColor(req.body);
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ EM: 'Lỗi server', EC: -1, DT: '' });
    }
};

const handleUpdateColor = async (req, res) => {
    try {
        const data = await colorService.updateColor(req.params.id, req.body);
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ EM: 'Lỗi server', EC: -1, DT: '' });
    }
};

const handleDeleteColor = async (req, res) => {
    try {
        const data = await colorService.deleteColor(req.params.id);
        return res.status(200).json(data);
    } catch (e) {
        console.log(e);
        return res.status(500).json({ EM: 'Lỗi server', EC: -1, DT: '' });
    }
};

module.exports = {
    handleGetAllColors, handleCreateColor, handleUpdateColor, handleDeleteColor
};
