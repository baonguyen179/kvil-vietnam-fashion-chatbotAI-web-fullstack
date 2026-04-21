'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Lấy tất cả người dùng có roleId
    const [users] = await queryInterface.sequelize.query(
      'SELECT id, roleId FROM Users WHERE roleId IS NOT NULL'
    );

    if (users && users.length > 0) {
      const userRolesData = users.map(user => ({
        userId: user.id,
        roleId: user.roleId,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // 2. Chèn dữ liệu vào bảng UserRoles
      await queryInterface.bulkInsert('UserRoles', userRolesData);
    }

    // 3. Xóa cột roleId khỏi bảng Users
    // Lưu ý: Cần xóa các ràng buộc khóa ngoại nếu có trước khi xóa cột (tùy thuộc vào DB, Sequelize thường tự xử lý nếu định nghĩa đúng, 
    // nhưng tốt nhất là removeColumn sẽ xử lý)
    await queryInterface.removeColumn('Users', 'roleId');
  },

  async down(queryInterface, Sequelize) {
    // Revert: Thêm lại cột roleId và migrate ngược lại
    await queryInterface.addColumn('Users', 'roleId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true
    });

    const [userRoles] = await queryInterface.sequelize.query(
      'SELECT userId, roleId FROM UserRoles'
    );

    if (userRoles && userRoles.length > 0) {
      for (const ur of userRoles) {
        await queryInterface.sequelize.query(
          `UPDATE Users SET roleId = ${ur.roleId} WHERE id = ${ur.userId}`
        );
      }
    }
  }
};
