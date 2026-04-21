'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'shippingFee', {
      type: Sequelize.DECIMAL,
      defaultValue: 0
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'shippingFee');
  }
};