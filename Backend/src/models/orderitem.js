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
    }
  }
  OrderItem.init({
    orderId: DataTypes.STRING,
    variantId: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};