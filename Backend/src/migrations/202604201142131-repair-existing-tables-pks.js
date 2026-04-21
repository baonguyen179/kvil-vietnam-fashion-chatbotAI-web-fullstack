'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = [
      'Users', 'UserAddresses', 'Categories', 'Products', 'ProductVariants', 
      'ProductImages', 'Collections', 'CollectionProducts', 'Carts', 
      'CartItems', 'Coupons', 'Orders', 'OrderItems', 'ChatLogs'
    ];

    for (const table of tables) {
      try {
        console.log(`Repairing table: ${table}`);
        // Thêm Primary Key cho cột id và đặt auto_increment
        await queryInterface.sequelize.query(
          `ALTER TABLE ${table} MODIFY id INT NOT NULL AUTO_INCREMENT, ADD PRIMARY KEY (id);`
        );
      } catch (error) {
        console.log(`Skip repairing ${table}: ${error.message}`);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Không cần rollback vì đây là sửa lỗi cấu trúc cơ bản
  }
};
