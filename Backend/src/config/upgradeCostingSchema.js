const db = require('../models/index');

const upgradeCostingSchema = async () => {
    try {
        console.log(">>> [MIGRATION] Bắt đầu kiểm tra và cập nhật cấu trúc database giá vốn...");
        
        // Kiểm tra xem cột avgCostPrice đã tồn tại trong ProductVariants chưa
        const queryInterface = db.sequelize.getQueryInterface();
        const tableInfo = await queryInterface.describeTable('ProductVariants');
        
        if (tableInfo.avgCostPrice) {
            console.log(">>> [MIGRATION] Cột avgCostPrice đã tồn tại trong bảng ProductVariants. Bỏ qua thêm mới.");
        } else {
            console.log(">>> [MIGRATION] Thêm cột avgCostPrice vào bảng ProductVariants...");
            await queryInterface.addColumn('ProductVariants', 'avgCostPrice', {
                type: db.Sequelize.DECIMAL(15, 2),
                defaultValue: 0.00,
                allowNull: false
            });
            console.log(">>> [MIGRATION] Đã thêm cột avgCostPrice thành công.");
        }

        // Cập nhật giá vốn ban đầu cho các biến thể dựa trên trung bình cộng dồn lịch sử IN logs
        console.log(">>> [MIGRATION] Đồng bộ hóa giá vốn ban đầu cho các ProductVariants từ InventoryLogs...");
        
        // Truy vấn tất cả ProductVariants để cập nhật từng cái một (đảm bảo tương thích mọi DB dialect)
        const variants = await db.ProductVariant.findAll({
            attributes: ['id']
        });

        for (const variant of variants) {
            // Lấy tất cả log IN có giá vốn của variant này
            const logs = await db.InventoryLog.findAll({
                where: {
                    variantId: variant.id,
                    type: 'IN',
                    costPrice: {
                        [db.Sequelize.Op.gt]: 0
                    }
                },
                attributes: ['quantity', 'costPrice']
            });

            if (logs.length > 0) {
                const totalQty = logs.reduce((sum, log) => sum + log.quantity, 0);
                const totalCost = logs.reduce((sum, log) => sum + (log.quantity * parseFloat(log.costPrice)), 0);
                const avgCost = totalQty > 0 ? (totalCost / totalQty) : 0;
                
                await db.ProductVariant.update(
                    { avgCostPrice: avgCost },
                    { where: { id: variant.id } }
                );
            }
        }
        
        console.log(">>> [MIGRATION] Đồng bộ hóa giá vốn hoàn tất.");
    } catch (error) {
        console.error(">>> [MIGRATION] Lỗi khi nâng cấp DB giá vốn:", error);
    }
};

module.exports = { upgradeCostingSchema };
