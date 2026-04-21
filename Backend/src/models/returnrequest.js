'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ReturnRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ReturnRequest.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
      ReturnRequest.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  ReturnRequest.init({
    orderId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    reason: DataTypes.TEXT,
    status: DataTypes.STRING,
    images: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ReturnRequest',
  });
  return ReturnRequest;
};
