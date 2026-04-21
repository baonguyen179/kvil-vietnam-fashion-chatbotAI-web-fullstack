'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      CartItem.belongsTo(models.Cart, { foreignKey: 'cartId', as: 'cart' });

      // Liên kết thẳng tới bảng Biến thể sản phẩm (để lấy ra Size, Màu, Giá hiện tại)
      CartItem.belongsTo(models.ProductVariant, { foreignKey: 'variantId', as: 'variant' });
    }
  }
  CartItem.init({
    cartId: DataTypes.INTEGER,
    variantId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CartItem',
  });
  return CartItem;
};