const db = require('../src/models/index');

async function validate() {
  try {
    console.log('--- Testing Models ---');
    console.log('Models loaded:', Object.keys(db).filter(k => k !== 'sequelize' && k !== 'Sequelize'));
    
    const modelsToCheck = ['User', 'Role', 'Order', 'ProductVariant', 'InventoryLog', 'PaymentTransaction', 'ReturnRequest'];
    for (const m of modelsToCheck) {
      if (db[m]) {
        console.log(`[OK] Model ${m} exists`);
      } else {
        console.error(`[FAIL] Model ${m} is missing!`);
      }
    }

    console.log('--- Testing Associations ---');
    const user = db.User.build();
    console.log('User associations:', Object.keys(user.__proto__).filter(k => k.startsWith('get') || k.startsWith('set')));

    const order = db.Order.build();
    console.log('Order associations:', Object.keys(order.__proto__).filter(k => k.startsWith('get') || k.startsWith('set')));

  } catch (error) {
    console.error('Validation error:', error);
  } finally {
    await db.sequelize.close();
  }
}

validate();
