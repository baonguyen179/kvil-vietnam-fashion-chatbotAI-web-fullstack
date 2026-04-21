'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Thêm cột roleId
    await queryInterface.addColumn('Users', 'roleId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true // Tạm thời để true để migrate dữ liệu
    });

    // 2. Di chuyển dữ liệu từ 'role' sang 'roleId'
    // Lấy danh sách roles mới tạo
    const [roles] = await queryInterface.sequelize.query('SELECT id, name FROM Roles');
    const superAdminRole = roles.find(r => r.name === 'SUPER_ADMIN');
    const customerRole = roles.find(r => r.name === 'CUSTOMER');

    if (superAdminRole) {
      await queryInterface.sequelize.query(
        `UPDATE Users SET roleId = ${superAdminRole.id} WHERE role = 'ADMIN'`
      );
    }
    if (customerRole) {
      await queryInterface.sequelize.query(
        `UPDATE Users SET roleId = ${customerRole.id} WHERE role = 'USER'`
      );
    }

    // 3. Xóa cột role cũ
    await queryInterface.removeColumn('Users', 'role');
  },

  async down(queryInterface, Sequelize) {
    // Revert lại: Thêm cột role, migrate ngược lại, xóa roleId
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.STRING
    });

    const [roles] = await queryInterface.sequelize.query('SELECT id, name FROM Roles');
    const superAdminRole = roles.find(r => r.name === 'SUPER_ADMIN');
    const customerRole = roles.find(r => r.name === 'CUSTOMER');

    if (superAdminRole) {
      await queryInterface.sequelize.query(
        `UPDATE Users SET role = 'ADMIN' WHERE roleId = ${superAdminRole.id}`
      );
    }
    if (customerRole) {
      await queryInterface.sequelize.query(
        `UPDATE Users SET role = 'USER' WHERE roleId = ${customerRole.id}`
      );
    }

    await queryInterface.removeColumn('Users', 'roleId');
  }
};
