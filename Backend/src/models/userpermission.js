'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserPermission extends Model {
    static associate(models) {
      // Junction logic
    }
  }
  UserPermission.init({
    userId: DataTypes.INTEGER,
    permissionId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserPermission',
  });
  return UserPermission;
};
