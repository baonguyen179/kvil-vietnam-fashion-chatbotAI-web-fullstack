'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [
      {
        name: 'SUPER_ADMIN',
        description: 'Quản trị viên cấp cao nhất',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'SALES',
        description: 'Nhân viên bán hàng',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ACCOUNTANT',
        description: 'Kế toán',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'CUSTOMER',
        description: 'Khách hàng',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
