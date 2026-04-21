'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm cột deletedAt vào bảng Coupons
    await queryInterface.addColumn('Coupons', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Nếu rollback thì xóa cột này đi
    await queryInterface.removeColumn('Coupons', 'deletedAt');
  }
};