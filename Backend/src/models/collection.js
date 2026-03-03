'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Collection extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Một Bộ sưu tập chứa nhiều Sản phẩm (Quan hệ n-n)
      Collection.belongsToMany(models.Product, {
        through: models.CollectionProduct,
        foreignKey: 'collectionId',
        as: 'products'
      });
    }
  }
  Collection.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    bannerUrl: DataTypes.STRING,
    slug: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Collection',
  });
  return Collection;
};