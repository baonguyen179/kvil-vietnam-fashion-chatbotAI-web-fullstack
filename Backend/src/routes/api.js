const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const categoryController = require('../controllers/categoryController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController');

const JWTAction = require('../middleware/JWTAction')
const uploadCloud = require('../config/cloudinary.config');

router.post('/auth/register', authController.handleRegister);
router.post('/auth/login', authController.handleLogin);
router.post('/auth/logout', authController.handleLogout);
router.post('/auth/refresh', authController.handleRefreshToken);

router.get('/categories', categoryController.handleGetAllCategories);
router.get('/products', productController.handleGetAllProducts);
router.get('/products/search', productController.handleSearchProducts);
router.get('/products/:id', productController.handleGetProductById);
//=====================================
router.use(JWTAction.checkUserJWT);

router.patch('/auth/change-password', authController.handleChangePassword);

router.get('/user/profile', userController.handleGetUserProfile);
router.put('/user/profile', userController.handleUpdateUserProfile);

router.get('/user/addresses', userController.handleGetUserAddresses);
router.post('/user/addresses', userController.handleCreateUserAddress);
router.put('/user/addresses/:id', userController.handleUpdateUserAddress);
router.delete('/user/addresses/:id', userController.handleDeleteUserAddress);
router.patch('/user/addresses/:id/default', userController.handleSetDefaultAddress);

router.get('/user/carts', cartController.handleGetCart);
router.post('/user/carts', cartController.handleAddToCart);
router.put('/user/carts/:id', cartController.handleUpdateCartItem);
router.delete('/user/carts/:id', cartController.handleDeleteCartItem);


//=====================================
router.use(JWTAction.checkUserPermission)

router.post('/admin/categories', categoryController.handleCreateCategory);
router.put('/admin/categories/:id', categoryController.handleUpdateCategory);
router.delete('/admin/categories/:id', categoryController.handleDeleteCategory);

router.post('/admin/products', productController.handleCreateProduct);
router.put('/admin/products/:id', productController.handleUpdateProduct);
router.delete('/admin/products/:id', productController.handleDeleteProduct);
router.post('/admin/products/:id/variants', productController.handleAddProductVariant);
router.post('/admin/products/:id/images', uploadCloud.array('images', 10), productController.handleAddProductImages);
router.delete('/admin/products/images/:imageId', productController.handleDeleteProductImage);

module.exports = router