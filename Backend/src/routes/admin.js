const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const collectionController = require('../controllers/collectionController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const dashboardController = require('../controllers/dashboardController');
const chatbotController = require('../controllers/chatbotController');
const roleController = require('../controllers/roleController');
const colorController = require('../controllers/colorController');
const sizeController = require('../controllers/sizeController');

const JWTAction = require('../middleware/JWTAction');
const uploadCloud = require('../config/cloudinary.config');

// Phải đăng nhập 
router.use(JWTAction.checkUserJWT);

// [ADMIN - USERS]-X
router.get('/admin/users', JWTAction.checkUserPermission([], ['users.manage']), userController.handleGetAdminUsers);
router.post('/admin/users', JWTAction.checkUserPermission([], ['users.manage']), userController.handleCreateAdminUser);
router.patch('/admin/users/:id/role', JWTAction.checkUserPermission([], ['users.manage']), userController.handleUpdateUserRole);

// [ADMIN - ROLES & PERMISSIONS]-X
router.get('/admin/roles', JWTAction.checkUserPermission([], ['users.manage']), roleController.handleGetAllRoles);
router.post('/admin/roles', JWTAction.checkUserPermission([], ['users.manage']), roleController.handleCreateRole);
router.put('/admin/roles/:id', JWTAction.checkUserPermission([], ['users.manage']), roleController.handleUpdateRole);
router.delete('/admin/roles/:id', JWTAction.checkUserPermission([], ['users.manage']), roleController.handleDeleteRole);
router.post('/admin/roles/:id/permissions', JWTAction.checkUserPermission([], ['users.manage']), roleController.handleAssignPermissionsToRole);
router.get('/admin/permissions', JWTAction.checkUserPermission([], ['users.manage']), roleController.handleGetAllPermissions);

// [INVENTORY & TRANSACTIONS]-X
const multer = require('multer');
const uploadMemory = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

router.get('/admin/inventory/logs', JWTAction.checkUserPermission([], ['inventory.read']), productController.handleGetInventoryLogs);
router.get('/admin/inventory/import/template', JWTAction.checkUserPermission([], ['inventory.read']), productController.handleGetInventoryTemplate);
router.post('/admin/inventory/import', JWTAction.checkUserPermission([], ['inventory.update', 'products.update']), uploadMemory.single('file'), productController.handleImportInventory);

router.get('/admin/payments/transactions', JWTAction.checkUserPermission([], ['payments.read']), orderController.handleGetPaymentTransactions);

// [RETURN REQUESTS]-X
router.get('/admin/orders/returns', JWTAction.checkUserPermission([], ['orders.read']), orderController.handleGetReturnRequests);
router.patch('/admin/orders/returns/:id/status', JWTAction.checkUserPermission([], ['orders.update']), orderController.handleUpdateReturnRequestStatus);

// [ADMIN - CATEGORIES]-X
router.post('/admin/categories', JWTAction.checkUserPermission([], ['categories.manage']), categoryController.handleCreateCategory);
router.put('/admin/categories/:id', JWTAction.checkUserPermission([], ['categories.manage']), categoryController.handleUpdateCategory);
router.delete('/admin/categories/:id', JWTAction.checkUserPermission([], ['categories.manage']), categoryController.handleDeleteCategory);

// [ADMIN - PRODUCTS]-X
router.post('/admin/products', JWTAction.checkUserPermission([], ['products.create']), productController.handleCreateProduct);
router.put('/admin/products/:id', JWTAction.checkUserPermission([], ['products.update']), productController.handleUpdateProduct);
router.delete('/admin/products/:id', JWTAction.checkUserPermission([], ['products.delete']), productController.handleDeleteProduct);
router.post('/admin/products/:id/variants', JWTAction.checkUserPermission([], ['products.update']), productController.handleAddProductVariant);
router.post('/admin/products/:id/images', JWTAction.checkUserPermission([], ['products.update']), uploadCloud.array('images', 10), productController.handleAddProductImages);
router.delete('/admin/products/images/:imageId', JWTAction.checkUserPermission([], ['products.update']), productController.handleDeleteProductImage);

// [ADMIN - COLORS & SIZES]
router.post('/admin/colors', JWTAction.checkUserPermission([], ['products.update']), colorController.handleCreateColor);
router.put('/admin/colors/:id', JWTAction.checkUserPermission([], ['products.update']), colorController.handleUpdateColor);
router.delete('/admin/colors/:id', JWTAction.checkUserPermission([], ['products.update']), colorController.handleDeleteColor);
router.post('/admin/sizes', JWTAction.checkUserPermission([], ['products.update']), sizeController.handleCreateSize);
router.put('/admin/sizes/:id', JWTAction.checkUserPermission([], ['products.update']), sizeController.handleUpdateSize);
router.delete('/admin/sizes/:id', JWTAction.checkUserPermission([], ['products.update']), sizeController.handleDeleteSize);

// [ADMIN - COLLECTIONS]-X
router.post('/admin/collections', JWTAction.checkUserPermission([], ['collections.manage']), uploadCloud.single('banner'), collectionController.handleCreateCollection);
router.put('/admin/collections/:id', JWTAction.checkUserPermission([], ['collections.manage']), uploadCloud.single('banner'), collectionController.handleUpdateCollection);
router.post('/admin/collections/:id/products', JWTAction.checkUserPermission([], ['collections.manage']), collectionController.handleAddProductsToCollection);
router.delete('/admin/collections/:id/products', JWTAction.checkUserPermission([], ['collections.manage']), collectionController.handleRemoveProductsFromCollection);

// [ADMIN - ORDERS]-X
router.get('/admin/orders', JWTAction.checkUserPermission([], ['orders.read']), orderController.handleGetAdminOrders);
router.patch('/admin/orders/:id/status', JWTAction.checkUserPermission([], ['orders.update']), orderController.handleUpdateOrderStatus);
router.patch('/admin/orders/:id/payment', JWTAction.checkUserPermission([], ['orders.update']), orderController.handleUpdatePaymentStatus);

// [ADMIN - VNPAY]
router.patch('/admin/orders/:id/vnpay-sync', JWTAction.checkUserPermission([], ['orders.update']), orderController.handleSyncVNPayStatus);

// [ADMIN - COUPONS]-X
router.post('/admin/coupons', JWTAction.checkUserPermission([], ['coupons.manage']), couponController.handleCreateCoupon);
router.get('/admin/coupons', JWTAction.checkUserPermission([], ['coupons.manage']), couponController.handleGetAdminCoupons);
router.put('/admin/coupons/:id', JWTAction.checkUserPermission([], ['coupons.manage']), couponController.handleUpdateCoupon);
router.delete('/admin/coupons/:id', JWTAction.checkUserPermission([], ['coupons.manage']), couponController.handleDeleteCoupon);

// [ADMIN - DASHBOARD]-X
router.get('/admin/dashboard/stats', JWTAction.checkUserPermission([], ['dashboard.read']), dashboardController.handleGetDashboardStats);

// [ADMIN - CHATBOT] QUẢN LÝ & GIÁM SÁT CHATBOT-X
router.get('/admin/chatbot/stats', JWTAction.checkUserPermission([], ['chatbot.read']), chatbotController.handleGetAdminChatStats);
router.get('/admin/chatbot/sessions', JWTAction.checkUserPermission([], ['chatbot.read']), chatbotController.handleGetAdminChatSessions);
router.get('/admin/chatbot/sessions/:sessionId', JWTAction.checkUserPermission([], ['chatbot.read']), chatbotController.handleGetAdminSessionDetail);
router.delete('/admin/chatbot/sessions/:sessionId', JWTAction.checkUserPermission([], ['chatbot.manage']), chatbotController.handleDeleteAdminChatSession);
router.delete('/admin/chatbot/users/:userId', JWTAction.checkUserPermission([], ['chatbot.manage']), chatbotController.handleDeleteAdminUserChats);

module.exports = router;