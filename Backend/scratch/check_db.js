const { Sequelize } = require('sequelize');
const config = require('../src/config/database.js')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect,
  logging: false,
  dialectOptions: config.dialectOptions
});

async function check() {
  try {
    const tables = [
      'Users', 'UserAddresses', 'Categories', 'Products', 'ProductVariants', 
      'ProductImages', 'Collections', 'CollectionProducts', 'Carts', 
      'CartItems', 'Coupons', 'Orders', 'OrderItems', 'ChatLogs'
    ];
    for (const table of tables) {
      console.log(`--- Table: ${table} ---`);
      const [results] = await sequelize.query(`DESC ${table}`);
      console.log("DESC:", results);
      const [indexes] = await sequelize.query(`SHOW INDEX FROM ${table}`);
      console.log("Indexes:", indexes);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sequelize.close();
  }
}

check();
