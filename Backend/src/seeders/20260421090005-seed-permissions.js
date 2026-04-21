'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Tạo danh sách quyền (Permissions)
    const permissions = [
      // Module: Sản phẩm
      { name: 'products.read', module: 'Products', description: 'Xem danh sách sản phẩm', createdAt: new Date(), updatedAt: new Date() },
      { name: 'products.create', module: 'Products', description: 'Thêm mới sản phẩm', createdAt: new Date(), updatedAt: new Date() },
      { name: 'products.update', module: 'Products', description: 'Cập nhật sản phẩm', createdAt: new Date(), updatedAt: new Date() },
      { name: 'products.delete', module: 'Products', description: 'Xóa sản phẩm', createdAt: new Date(), updatedAt: new Date() },

      // Module: Đơn hàng
      { name: 'orders.read', module: 'Orders', description: 'Xem danh sách đơn hàng', createdAt: new Date(), updatedAt: new Date() },
      { name: 'orders.update', module: 'Orders', description: 'Cập nhật trạng thái đơn hàng', createdAt: new Date(), updatedAt: new Date() },

      // Module: Chatbot
      { name: 'chatbot.read', module: 'Chatbot', description: 'Xem lịch sử chat', createdAt: new Date(), updatedAt: new Date() },
      { name: 'chatbot.manage', module: 'Chatbot', description: 'Quản lý cấu hình chatbot', createdAt: new Date(), updatedAt: new Date() },

      // Module: Khuyến mãi
      { name: 'coupons.manage', module: 'Coupons', description: 'Quản lý mã giảm giá', createdAt: new Date(), updatedAt: new Date() },

      // Module: Hệ thống
      { name: 'users.manage', module: 'System', description: 'Quản lý người dùng và phân quyền', createdAt: new Date(), updatedAt: new Date() },
    ];

    await queryInterface.bulkInsert('Permissions', permissions);

    // 2. Lấy ID của Roles và Permissions để gán
    const [dbRoles] = await queryInterface.sequelize.query('SELECT id, name FROM Roles');
    const [dbPermissions] = await queryInterface.sequelize.query('SELECT id, name FROM Permissions');

    const rolePerms = [];

    const getPermId = (name) => dbPermissions.find(p => p.name === name)?.id;
    const getRoleId = (name) => dbRoles.find(r => r.name === name)?.id;

    const superAdminId = getRoleId('SUPER_ADMIN');
    const salesId = getRoleId('SALES');
    const accountantId = getRoleId('ACCOUNTANT');

    // Gán TẤT CẢ quyền cho SUPER_ADMIN
    if (superAdminId) {
      dbPermissions.forEach(p => {
        rolePerms.push({ roleId: superAdminId, permissionId: p.id, createdAt: new Date(), updatedAt: new Date() });
      });
    }

    // Gán quyền cho SALES
    if (salesId) {
      const salesPerms = ['products.read', 'products.update', 'orders.read', 'orders.update', 'chatbot.read'];
      salesPerms.forEach(name => {
        const id = getPermId(name);
        if (id) rolePerms.push({ roleId: salesId, permissionId: id, createdAt: new Date(), updatedAt: new Date() });
      });
    }

    // Gán quyền cho ACCOUNTANT
    if (accountantId) {
      const accPerms = ['orders.read', 'coupons.manage'];
      accPerms.forEach(name => {
        const id = getPermId(name);
        if (id) rolePerms.push({ roleId: accountantId, permissionId: id, createdAt: new Date(), updatedAt: new Date() });
      });
    }

    if (rolePerms.length > 0) {
      await queryInterface.bulkInsert('RolePermissions', rolePerms);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('RolePermissions', null, {});
    await queryInterface.bulkDelete('Permissions', null, {});
  }
};
