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
      ProductVariant.belongsTo(models.Size, { foreignKey: 'sizeId', as: 'size' });
      ProductVariant.belongsTo(models.Color, { foreignKey: 'colorId', as: 'color' });

      ProductVariant.hasMany(models.OrderItem, { foreignKey: 'variantId', as: 'orderItems' });
      ProductVariant.hasMany(models.CartItem, { foreignKey: 'variantId', as: 'cartItems' });
      ProductVariant.hasMany(models.InventoryLog, { foreignKey: 'variantId', as: 'inventoryLogs' });
    }
  }
  ProductVariant.init({
    productId: DataTypes.INTEGER,
    sizeId: DataTypes.INTEGER,
    colorId: DataTypes.INTEGER,
    stock: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    sku: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'ProductVariant',
  });
  return ProductVariant;
};