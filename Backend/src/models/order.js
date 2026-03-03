'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Đơn hàng thuộc về ai?
      Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });

      // Đơn hàng áp dụng mã giảm giá nào?
      Order.belongsTo(models.Coupon, { foreignKey: 'couponId', as: 'coupon' });

      // Đơn hàng có những chi tiết sản phẩm nào?
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'orderItems' });
    }
  }
  Order.init({
    userId: DataTypes.STRING,
    couponId: DataTypes.STRING,
    totalBeforeDiscount: DataTypes.DECIMAL,
    discountAmount: DataTypes.DECIMAL,
    finalAmount: DataTypes.DECIMAL,
    paymentMethod: DataTypes.STRING,
    paymentStatus: DataTypes.BOOLEAN,
    shippingAddress: DataTypes.TEXT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};