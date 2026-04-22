'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Thêm ràng buộc Unique cho cột sku trong bảng ProductVariants
     * Sử dụng addIndex với thuộc tính unique: true là cách an toàn nhất trong Sequelize
     */
    await queryInterface.addIndex('ProductVariants', ['sku'], {
      unique: true,
      name: 'product_variants_sku_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Xóa chỉ mục unique khi rollback
     */
    await queryInterface.removeIndex('ProductVariants', 'product_variants_sku_unique');
  }
};
