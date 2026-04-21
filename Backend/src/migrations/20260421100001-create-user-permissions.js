'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserPermissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      permissionId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Permissions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Thêm index duy nhất để tránh gán trùng quyền cho một User
    await queryInterface.addIndex('UserPermissions', ['userId', 'permissionId'], {
      unique: true,
      name: 'user_permission_unique'
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserPermissions');
  }
};
