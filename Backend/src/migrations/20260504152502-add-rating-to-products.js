'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Products', 'ratingAvg', {
      type: Sequelize.DECIMAL(3, 1),
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('Products', 'reviewCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Products', 'ratingAvg');
    await queryInterface.removeColumn('Products', 'reviewCount');
  }
};
