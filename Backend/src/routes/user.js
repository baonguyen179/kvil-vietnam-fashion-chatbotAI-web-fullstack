const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');

const JWTAction = require('../middleware/JWTAction');

router.use(JWTAction.checkUserJWT);

// [AUTH - Đổi mật khẩu]
router.patch('/auth/change-password', authController.handleChangePassword);

// [USER PROFILE & ADDRESSES]
router.get('/user/profile', userController.handleGetUserProfile);
router.put('/user/profile', userController.handleUpdateUserProfile);

router.get('/user/addresses', userController.handleGetUserAddresses);
router.post('/user/addresses', userController.handleCreateUserAddress);
router.put('/user/addresses/:id', userController.handleUpdateUserAddress);
router.delete('/user/addresses/:id', userController.handleDeleteUserAddress);
router.patch('/user/addresses/:id/default', userController.handleSetDefaultAddress);

// [CART]
router.get('/user/carts', cartController.handleGetCart);
router.post('/user/carts', cartController.handleAddToCart);
router.put('/user/carts/:id', cartController.handleUpdateCartItem);
router.delete('/user/carts/:id', cartController.handleDeleteCartItem);

// [ORDERS]
router.post('/user/orders', orderController.handleCreateOrder);
router.put('/user/orders/:id/cancel', orderController.handleCancelOrder);
router.get('/user/orders', orderController.handleGetUserOrders);
router.get('/user/orders/:id', orderController.handleGetUserOrderDetail);

module.exports = router;