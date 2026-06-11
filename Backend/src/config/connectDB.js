require('dotenv').config()
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,

    pool: {
        max: 20,      // Tối đa 20 kết nối cùng lúc. Đủ sức cân hàng ngàn request vì Node.js xử lý cực nhanh.
        min: 2,       // Lúc nào cũng giữ sẵn 2 kết nối chạy ngầm để request đầu tiên không bị chậm.
        acquire: 30000, // Thời gian tối đa (ms) xếp hàng chờ. Quá 30s mà chưa tới lượt lấy xe -> ném lỗi Timeout.
        idle: 10000     // Rảnh rỗi quá 10s (không có request) thì tự động hủy kết nối để giải phóng RAM cho MySQL.
    },
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Bỏ qua xác thực chứng chỉ tự ký
        }
    }
});

const connection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        
        // Tự động kiểm tra và nâng cấp phân quyền & giá vốn khi kết nối thành công
        setTimeout(async () => {
            try {
                const { upgradePermissions } = require('./upgradePermissions');
                await upgradePermissions();
            } catch (err) {
                console.error('>>> Lỗi khi di cư nâng cấp phân quyền:', err);
            }

            try {
                const { upgradeCostingSchema } = require('./upgradeCostingSchema');
                await upgradeCostingSchema();
            } catch (err) {
                console.error('>>> Lỗi khi di cư nâng cấp giá vốn:', err);
            }
        }, 1000);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
module.exports = connection