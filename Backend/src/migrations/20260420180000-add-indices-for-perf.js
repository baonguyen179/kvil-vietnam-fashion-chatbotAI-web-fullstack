'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm Index cho InventoryLogs
    await queryInterface.addIndex('InventoryLogs', ['type'], {
      name: 'idx_inventory_logs_type'
    });
    await queryInterface.addIndex('InventoryLogs', ['variantId'], {
      name: 'idx_inventory_logs_variant'
    });
    await queryInterface.addIndex('InventoryLogs', ['createdAt'], {
      name: 'idx_inventory_logs_created_at'
    });

    // Thêm Index cho PaymentTransactions
    await queryInterface.addIndex('PaymentTransactions', ['status'], {
      name: 'idx_payment_transactions_status'
    });
    await queryInterface.addIndex('PaymentTransactions', ['provider'], {
      name: 'idx_payment_transactions_provider'
    });
    await queryInterface.addIndex('PaymentTransactions', ['orderId'], {
      name: 'idx_payment_transactions_order'
    });
    await queryInterface.addIndex('PaymentTransactions', ['createdAt'], {
      name: 'idx_payment_transactions_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    // Xóa Index InventoryLogs
    await queryInterface.removeIndex('InventoryLogs', 'idx_inventory_logs_type');
    await queryInterface.removeIndex('InventoryLogs', 'idx_inventory_logs_variant');
    await queryInterface.removeIndex('InventoryLogs', 'idx_inventory_logs_created_at');

    // Xóa Index PaymentTransactions
    await queryInterface.removeIndex('PaymentTransactions', 'idx_payment_transactions_status');
    await queryInterface.removeIndex('PaymentTransactions', 'idx_payment_transactions_provider');
    await queryInterface.removeIndex('PaymentTransactions', 'idx_payment_transactions_order');
    await queryInterface.removeIndex('PaymentTransactions', 'idx_payment_transactions_created_at');
  }
};
