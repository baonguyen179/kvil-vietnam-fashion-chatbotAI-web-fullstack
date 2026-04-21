'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Bổ sung thêm các quyền còn thiếu
    const additionalPermissions = [
      { name: 'dashboard.read', module: 'System', description: 'Xem thống kê báo cáo doanh thu', createdAt: new Date(), updatedAt: new Date() },
      { name: 'inventory.read', module: 'Products', description: 'Xem lịch sử nhập xuất kho', createdAt: new Date(), updatedAt: new Date() },
      { name: 'payments.read', module: 'Orders', description: 'Xem các giao dịch thanh toán', createdAt: new Date(), updatedAt: new Date() },
      { name: 'categories.manage', module: 'Products', description: 'Quản trị danh mục sản phẩm', createdAt: new Date(), updatedAt: new Date() },
      { name: 'collections.manage', module: 'Products', description: 'Quản trị các bộ sưu tập', createdAt: new Date(), updatedAt: new Date() },
    ];

    await queryInterface.bulkInsert('Permissions', additionalPermissions);

    // 2. Gán quyền bổ sung cho các Role tương ứng
    const [dbRoles] = await queryInterface.sequelize.query('SELECT id, name FROM Roles');
    const [dbPermissions] = await queryInterface.sequelize.query('SELECT id, name FROM Permissions');

    const getPermId = (name) => dbPermissions.find(p => p.name === name)?.id;
    const getRoleId = (name) => dbRoles.find(r => r.name === name)?.id;

    const rolePerms = [];
    const superAdminId = getRoleId('SUPER_ADMIN');
    const salesId = getRoleId('SALES');
    const accountantId = getRoleId('ACCOUNTANT');

    // SUPER_ADMIN lấy hết quyền mới
    if (superAdminId) {
        additionalPermissions.forEach(p => {
            const id = getPermId(p.name);
            if (id) rolePerms.push({ roleId: superAdminId, permissionId: id, createdAt: new Date(), updatedAt: new Date() });
        });
    }

    // SALES được xem kho và quản lý danh mục/BST
    if (salesId) {
        const salesAdd = ['inventory.read', 'categories.manage', 'collections.manage'];
        salesAdd.forEach(name => {
            const id = getPermId(name);
            if (id) rolePerms.push({ roleId: salesId, permissionId: id, createdAt: new Date(), updatedAt: new Date() });
        });
    }

    // ACCOUNTANT được xem thống kê và xem giao dịch thanh toán
    if (accountantId) {
        const accAdd = ['dashboard.read', 'payments.read'];
        accAdd.forEach(name => {
            const id = getPermId(name);
            if (id) rolePerms.push({ roleId: accountantId, permissionId: id, createdAt: new Date(), updatedAt: new Date() });
        });
    }

    if (rolePerms.length > 0) {
        await queryInterface.bulkInsert('RolePermissions', rolePerms);
    }
  },

  async down(queryInterface, Sequelize) {
    // Không cần thiết kế down phức tạp vì đây là bổ sung
  }
};
