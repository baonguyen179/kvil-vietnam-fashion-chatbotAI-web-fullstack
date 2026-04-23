'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Thêm các cột mới (cho phép null tạm thời nếu DB có dữ liệu cũ để tránh lỗi constraints)
    await queryInterface.addColumn('ProductVariants', 'sizeId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Sizes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    
    await queryInterface.addColumn('ProductVariants', 'colorId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'Colors',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Xóa các cột cũ
    await queryInterface.removeColumn('ProductVariants', 'size');
    await queryInterface.removeColumn('ProductVariants', 'color');
  },

  async down (queryInterface, Sequelize) {
    // Hoàn tác: Xóa cột mới, thêm lại cột cũ
    await queryInterface.removeColumn('ProductVariants', 'sizeId');
    await queryInterface.removeColumn('ProductVariants', 'colorId');

    await queryInterface.addColumn('ProductVariants', 'size', {
      type: Sequelize.STRING
    });
    await queryInterface.addColumn('ProductVariants', 'color', {
      type: Sequelize.STRING
    });
  }
};
