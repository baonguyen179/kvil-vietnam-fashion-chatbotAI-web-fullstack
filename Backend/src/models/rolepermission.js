'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // junctions typically don't need additional associations here 
      // as they are used in belongsToMany
    }
  }
  RolePermission.init({
    roleId: DataTypes.INTEGER,
    permissionId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'RolePermission',
  });
  return RolePermission;
};
