'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('InventoryLogs', 'costPrice', {
      type: Sequelize.DECIMAL(15, 2),
      defaultValue: 0
    });
    await queryInterface.addColumn('OrderItems', 'costPrice', {
      type: Sequelize.DECIMAL(15, 2),
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('InventoryLogs', 'costPrice');
    await queryInterface.removeColumn('OrderItems', 'costPrice');
  }
};
