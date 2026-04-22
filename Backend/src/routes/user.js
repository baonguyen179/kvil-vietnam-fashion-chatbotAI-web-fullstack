const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');

const JWTAction = require('../middleware/JWTAction');


// Route để tạo order, cho phép cả user đã login và khách vãng lai
router.post('/user/orders', JWTAction.optionalAuth, orderController.handleCreateOrder);


// TẤT CẢ CÁC ROUTE BÊN DƯỚI ĐỀU YÊU CẦU ĐĂNG NHẬP
router.use(JWTAction.checkUserJWT);

// [AUTH - Đổi mật khẩu]-X
router.patch('/auth/change-password', authController.handleChangePassword);

// [USER PROFILE & ADDRESSES]-X
router.get('/user/profile', userController.handleGetUserProfile);
router.put('/user/profile', userController.handleUpdateUserProfile);

router.get('/user/addresses', userController.handleGetUserAddresses);
router.post('/user/addresses', userController.handleCreateUserAddress);
router.put('/user/addresses/:id', userController.handleUpdateUserAddress);
router.delete('/user/addresses/:id', userController.handleDeleteUserAddress);
router.patch('/user/addresses/:id/default', userController.handleSetDefaultAddress);

// [CART]-X
router.get('/user/carts', cartController.handleGetCart);
router.post('/user/carts', cartController.handleAddToCart);
router.put('/user/carts/:id', cartController.handleUpdateCartItem);
router.delete('/user/carts/:id', cartController.handleDeleteCartItem);

// [ORDERS] - CÁC ROUTE LIÊN QUAN ĐẾN QUẢN LÝ ORDER CÁ NHÂN-X
router.put('/user/orders/:id/cancel', orderController.handleCancelOrder);
router.get('/user/orders', orderController.handleGetUserOrders);
router.get('/user/orders/:id', orderController.handleGetUserOrderDetail);
router.post('/user/orders/:id/return', orderController.handleRequestReturnOrder);

// [PAYMENT] - CÁC ROUTE LIÊN QUAN ĐẾN THANH TOÁN
router.get('/user/orders/:id/payment-url', orderController.handleGetVNPayUrl);

module.exports = router;