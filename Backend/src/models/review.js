'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
      Review.belongsTo(models.OrderItem, { foreignKey: 'orderItemId', as: 'orderItem' });
      Review.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Review.hasMany(models.ReviewImage, { foreignKey: 'reviewId', as: 'images' });
    }
  }
  Review.init({
    productId: DataTypes.INTEGER,
    orderItemId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    rating: DataTypes.INTEGER,
    comment: DataTypes.TEXT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};
