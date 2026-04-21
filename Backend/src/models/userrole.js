'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserRole extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // junctions typically don't need additional associations here
    }
  }
  UserRole.init({
    userId: DataTypes.INTEGER,
    roleId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserRole',
  });
  return UserRole;
};
