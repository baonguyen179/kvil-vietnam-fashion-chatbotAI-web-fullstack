'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InventoryLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      InventoryLog.belongsTo(models.ProductVariant, { foreignKey: 'variantId', as: 'variant' });
      InventoryLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  InventoryLog.init({
    variantId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    costPrice: DataTypes.DECIMAL(15, 2),
    note: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'InventoryLog',
  });
  return InventoryLog;
};
