'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Một User có nhiều Địa chỉ
      User.hasMany(models.UserAddress, { foreignKey: 'userId', as: 'addresses' });

      User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });
      User.hasOne(models.Cart, { foreignKey: 'userId', as: 'cart' });
      User.belongsToMany(models.Role, {
        through: 'UserRoles',
        foreignKey: 'userId',
        otherKey: 'roleId',
        as: 'roles'
      });
      User.belongsToMany(models.Permission, {
        through: 'UserPermissions',
        foreignKey: 'userId',
        otherKey: 'permissionId',
        as: 'individualPermissions'
      });
      User.hasMany(models.InventoryLog, { foreignKey: 'userId', as: 'inventoryLogs' });
      User.hasMany(models.ReturnRequest, { foreignKey: 'userId', as: 'returnRequests' });
      User.hasMany(models.ChatLog, { foreignKey: 'userId', as: 'chatLogs' });
    }
  }
  User.init({
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    fullName: DataTypes.STRING,
    birthday: DataTypes.DATE,
    gender: DataTypes.BOOLEAN,
    refresh_token: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};