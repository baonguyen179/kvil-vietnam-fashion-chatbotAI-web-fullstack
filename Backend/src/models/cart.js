'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Thuộc về 1 User
      Cart.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });

      // Chứa nhiều CartItem
      Cart.hasMany(models.CartItem, { foreignKey: 'cartId', as: 'cartItems' });
    }
  }
  Cart.init({
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Cart',
  });
  return Cart;
};