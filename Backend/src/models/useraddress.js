'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserAddress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Một Địa chỉ thuộc về một User
      UserAddress.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  UserAddress.init({
    userId: DataTypes.INTEGER,
    receiverName: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    province: DataTypes.STRING,
    ward: DataTypes.STRING,
    detailAddress: DataTypes.STRING,
    isDefault: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'UserAddress',
  });
  return UserAddress;
};