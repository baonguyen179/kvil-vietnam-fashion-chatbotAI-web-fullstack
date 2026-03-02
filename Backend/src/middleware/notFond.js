const notFoundHandler = (req, res) => {
    return res.status(404).json({
        EC: -1,
        EM: 'Not found current URL/Method',
        DT: ''
    });

};

module.exports = notFoundHandler;