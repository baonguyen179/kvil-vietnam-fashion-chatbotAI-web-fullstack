'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class ChatLog extends Model {
        static associate(models) {
            // ChatLog thuộc về 1 User (có thể null nếu khách chưa đăng nhập)
            ChatLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }
    ChatLog.init({
        userId: {
            type: DataTypes.INTEGER,
            allowNull: true // Khách vãng lai vẫn chat được
        },
        sessionId: DataTypes.STRING,
        sender: DataTypes.STRING, // 'USER' hoặc 'BOT'
        message: DataTypes.TEXT,
        metadata: DataTypes.TEXT // Lưu chuỗi JSON chứa ID sản phẩm gợi ý
    }, {
        sequelize,
        modelName: 'ChatLog',
    });
    return ChatLog;
};