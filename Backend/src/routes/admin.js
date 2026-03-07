const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const collectionController = require('../controllers/collectionController');
const orderController = require('../controllers/orderController')

const JWTAction = require('../middleware/JWTAction');
const uploadCloud = require('../config/cloudinary.config');

// Bức tường bảo vệ kép: Phải đăng nhập VÀ phải có quyền Admin
router.use(JWTAction.checkUserJWT);
router.use(JWTAction.checkUserPermission);

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

module.exports = router;