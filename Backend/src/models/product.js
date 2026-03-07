'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Thuộc về 1 Danh mục
      Product.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });

      // Có nhiều Hình ảnh
      Product.hasMany(models.ProductImage, { foreignKey: 'productId', as: 'images' });

      // Có nhiều Biến thể (Size, Màu)
      Product.hasMany(models.ProductVariant, { foreignKey: 'productId', as: 'variants' });

      // Thuộc nhiều Bộ sưu tập (Quan hệ n-n thông qua bảng trung gian CollectionProduct)
      Product.belongsToMany(models.Collection, {
        through: models.CollectionProduct,
        foreignKey: 'productId',
        as: 'collections'
      });
    }
  }
  Product.init({
    categoryId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    basePrice: DataTypes.DECIMAL,
    discountPercent: DataTypes.INTEGER,
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Product',
    paranoid: true,
    timestamps: true,
  });
  return Product;
};