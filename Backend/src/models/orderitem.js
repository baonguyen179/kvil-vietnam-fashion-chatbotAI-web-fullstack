'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Chi tiết này thuộc Đơn hàng nào?
      OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });

      // Chi tiết này mua Biến thể sản phẩm nào?
      OrderItem.belongsTo(models.ProductVariant, { foreignKey: 'variantId', as: 'variant' });

      // Chi tiết đơn hàng này có thể có 1 đánh giá
      OrderItem.hasOne(models.Review, { foreignKey: 'orderItemId', as: 'review' });
    }
  }
  OrderItem.init({
    orderId: DataTypes.INTEGER,
    variantId: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    costPrice: DataTypes.DECIMAL(15, 2)
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};