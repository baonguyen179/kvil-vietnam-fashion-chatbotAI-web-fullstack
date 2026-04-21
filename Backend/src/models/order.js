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

      // Đơn hàng có những chi tiết sản phẩm nào?
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'orderItems' });

      // Các giao dịch thanh toán liên quan đến đơn hàng
      Order.hasMany(models.PaymentTransaction, { foreignKey: 'orderId', as: 'transactions' });

      // Yêu cầu trả hàng liên quan đến đơn hàng
      Order.hasMany(models.ReturnRequest, { foreignKey: 'orderId', as: 'returnRequests' });
    }
  }
  Order.init({
    userId: DataTypes.INTEGER,
    couponId: DataTypes.INTEGER,
    totalBeforeDiscount: DataTypes.DECIMAL,
    discountAmount: DataTypes.DECIMAL,
    shippingFee: DataTypes.DECIMAL,
    finalAmount: DataTypes.DECIMAL,
    paymentMethod: DataTypes.STRING,
    paymentStatus: DataTypes.BOOLEAN,
    shippingAddress: DataTypes.TEXT,
    deliveryMethod: DataTypes.TEXT,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};