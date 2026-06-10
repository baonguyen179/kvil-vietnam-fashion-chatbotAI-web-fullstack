const db = require('../models/index');

const upgradePermissions = async () => {
    try {
        //  Kiểm tra xem orders.update_confirm đã tồn tại chưa
        const checkPerm = await db.Permission.findOne({ where: { name: 'orders.update_confirm' } });
        if (checkPerm) {
            console.log('>>> Quyền mới đã tồn tại, bỏ qua di cư.');
            return;
        }

        console.log('>>> Bắt đầu nâng cấp phân quyền (Orders.update -> Granular State Machine Permissions)...');

        //  Tìm ID của orders.update
        const oldPerm = await db.Permission.findOne({ where: { name: 'orders.update' } });
        
        //  Tạo các quyền mới
        const newPermsData = [
            { name: 'orders.update_confirm', module: 'Orders', description: 'Xác nhận đơn hàng (Pending -> Confirmed)' },
            { name: 'orders.update_ship', module: 'Orders', description: 'Bàn giao vận chuyển / nhận tại quầy (Confirmed -> Shipping/Delivered)' },
            { name: 'orders.update_complete', module: 'Orders', description: 'Hoàn thành giao hàng (Shipping -> Delivered)' },
            { name: 'orders.update_cancel', module: 'Orders', description: 'Hủy đơn hàng' },
            { name: 'orders.update_payment', module: 'Orders', description: 'Cập nhật thanh toán & Đồng bộ VNPay' },
            { name: 'orders.update_approve_return', module: 'Orders', description: 'Duyệt/Từ chối yêu cầu đổi trả (CSKH)' },
            { name: 'orders.update_receive_return', module: 'Orders', description: 'Xác nhận nhận hàng hoàn vật lý (Thủ kho)' },
            { name: 'reviews.update_status', module: 'Reviews', description: 'Cập nhật trạng thái đánh giá (Hiện/Ẩn)' }
        ];

        const createdPerms = [];
        for (const p of newPermsData) {
            const [perm, created] = await db.Permission.findOrCreate({
                where: { name: p.name },
                defaults: {
                    module: p.module,
                    description: p.description,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            createdPerms.push(perm);
        }

        if (oldPerm) {
            //  Tìm các roles đang liên kết với orders.update
            const rolePerms = await db.RolePermission.findAll({ where: { permissionId: oldPerm.id } });
            if (rolePerms && rolePerms.length > 0) {
                const newRolePerms = [];
                for (const rp of rolePerms) {
                    for (const cp of createdPerms) {
                        newRolePerms.push({
                            roleId: rp.roleId,
                            permissionId: cp.id,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    }
                }
                for (const rp of newRolePerms) {
                    await db.RolePermission.findOrCreate({
                        where: { roleId: rp.roleId, permissionId: rp.permissionId },
                        defaults: rp
                    });
                }
            }

            //  Tìm các users đang liên kết cá nhân với orders.update
            const userPerms = await db.UserPermission.findAll({ where: { permissionId: oldPerm.id } });
            if (userPerms && userPerms.length > 0) {
                const newUserPerms = [];
                for (const up of userPerms) {
                    for (const cp of createdPerms) {
                        newUserPerms.push({
                            userId: up.userId,
                            permissionId: cp.id,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                    }
                }
                for (const up of newUserPerms) {
                    await db.UserPermission.findOrCreate({
                        where: { userId: up.userId, permissionId: up.permissionId },
                        defaults: up
                    });
                }
            }

            //  Xóa oldPerm liên kết và bản thân oldPerm
            await db.RolePermission.destroy({ where: { permissionId: oldPerm.id } });
            await db.UserPermission.destroy({ where: { permissionId: oldPerm.id } });
            await oldPerm.destroy();
            console.log('>>> Đã di chuyển và xóa thành công quyền orders.update cũ.');
        }

        //  Xóa hết cache Redis liên quan đến phân quyền
        const redisHelper = require('../helpers/redis.helper');
        await redisHelper.delByPattern('user:profile:*');

        console.log('>>> Nâng cấp phân quyền hoàn tất thành công!');
    } catch (e) {
        console.error('>>> Lỗi khi di cư phân quyền:', e);
    }
};

module.exports = { upgradePermissions };
