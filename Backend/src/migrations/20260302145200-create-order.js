'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.STRING
      },
      couponId: {
        type: Sequelize.STRING
      },
      totalBeforeDiscount: {
        type: Sequelize.DECIMAL
      },
      discountAmount: {
        type: Sequelize.DECIMAL
      },
      finalAmount: {
        type: Sequelize.DECIMAL
      },
      paymentMethod: {
        type: Sequelize.STRING
      },
      paymentStatus: {
        type: Sequelize.BOOLEAN
      },
      shippingAddress: {
        type: Sequelize.TEXT
      },
      status: {
        type: Sequelize.STRING
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};