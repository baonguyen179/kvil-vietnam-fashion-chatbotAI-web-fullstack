'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Coupon extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Một Mã giảm giá được áp dụng cho nhiều Đơn hàng
      Coupon.hasMany(models.Order, { foreignKey: 'couponId', as: 'orders' });
    }
  }
  Coupon.init({
    code: DataTypes.STRING,
    discountType: DataTypes.STRING,
    discountValue: DataTypes.DECIMAL,
    minOrderValue: DataTypes.DECIMAL,
    maxDiscountAmount: DataTypes.DECIMAL,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    usageLimit: DataTypes.INTEGER,
    usedCount: DataTypes.INTEGER,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Coupon',
  });
  return Coupon;
};