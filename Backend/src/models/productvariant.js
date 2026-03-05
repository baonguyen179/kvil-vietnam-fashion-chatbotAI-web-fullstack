'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductVariant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductVariant.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });

      // Một biến thể có thể nằm trong nhiều Chi tiết đơn hàng khác nhau
      ProductVariant.hasMany(models.OrderItem, { foreignKey: 'variantId', as: 'orderItems' });
      ProductVariant.hasMany(models.CartItem, { foreignKey: 'variantId', as: 'cartItems' });
    }
  }
  ProductVariant.init({
    productId: DataTypes.INTEGER,
    size: DataTypes.STRING,
    color: DataTypes.STRING,
    stock: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    sku: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ProductVariant',
  });
  return ProductVariant;
};