const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const collectionController = require('../controllers/collectionController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController')
const dashboardController = require('../controllers/dashboardController');

const JWTAction = require('../middleware/JWTAction');
const uploadCloud = require('../config/cloudinary.config');

//Phải đăng nhập VÀ phải có quyền Admin
router.use(JWTAction.checkUserJWT);
router.use(JWTAction.checkUserPermission);

// [ADMIN - USERS]
router.get('/admin/users', userController.handleGetAdminUsers);
router.patch('/admin/users/:id/role', userController.handleUpdateUserRole);
// [ADMIN - CATEGORIES]
router.post('/admin/categories', categoryController.handleCreateCategory);
router.put('/admin/categories/:id', categoryController.handleUpdateCategory);
router.delete('/admin/categories/:id', categoryController.handleDeleteCategory);

// [ADMIN - PRODUCTS]
router.post('/admin/products', productController.handleCreateProduct);
router.put('/admin/products/:id', productController.handleUpdateProduct);
router.delete('/admin/products/:id', productController.handleDeleteProduct);
router.post('/admin/products/:id/variants', productController.handleAddProductVariant);
router.post('/admin/products/:id/images', uploadCloud.array('images', 10), productController.handleAddProductImages);
router.delete('/admin/products/images/:imageId', productController.handleDeleteProductImage);

// [ADMIN - COLLECTIONS]
router.post('/admin/collections', uploadCloud.single('banner'), collectionController.handleCreateCollection);
router.put('/admin/collections/:id', uploadCloud.single('banner'), collectionController.handleUpdateCollection);
router.post('/admin/collections/:id/products', collectionController.handleAddProductsToCollection);
router.delete('/admin/collections/:id/products', collectionController.handleRemoveProductsFromCollection);

// [ADMIN - ORDERS]
router.get('/admin/orders', orderController.handleGetAdminOrders);
router.patch('/admin/orders/:id/status', orderController.handleUpdateOrderStatus);
router.patch('/admin/orders/:id/payment', orderController.handleUpdatePaymentStatus);

// [ADMIN - COUPONS]
router.post('/admin/coupons', couponController.handleCreateCoupon);
router.get('/admin/coupons', couponController.handleGetAdminCoupons);
router.put('/admin/coupons/:id', couponController.handleUpdateCoupon);
router.delete('/admin/coupons/:id', couponController.handleDeleteCoupon);

// [ADMIN - DASHBOARD]
router.get('/admin/dashboard/stats', dashboardController.handleGetDashboardStats);

module.exports = router;