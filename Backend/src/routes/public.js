const express = require('express');
const router = express.Router();

// Lấy các Controller tương ứng
const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const collectionController = require('../controllers/collectionController');
const chatbotController = require('../controllers/chatbotController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');


// [VNPAY CALLBACKS]
router.get('/vnpay/ipn', orderController.handleVNPayIPN);
router.get('/vnpay/return', orderController.handleVNPayReturn);
router.post('/order/vnpay-url/guest', orderController.handleGetGuestVNPayUrl);

// [AUTH]-X
router.post('/auth/register', authController.handleRegister);
router.post('/auth/login', authController.handleLogin);
router.post('/auth/logout', authController.handleLogout);
router.post('/auth/refresh', authController.handleRefreshToken);

// [CATEGORIES & PRODUCTS]-X
router.get('/categories', categoryController.handleGetAllCategories);
router.get('/products', productController.handleGetAllProducts);
router.get('/products/search', productController.handleSearchProducts);
router.get('/products/best-seller', productController.handleGetBestSellerProducts);
router.get('/products/:id', productController.handleGetProductById);

// [COLLECTIONS]-X
router.get('/collections', collectionController.handleGetPublicCollections);
router.get('/collections/:slug', collectionController.handleGetCollectionBySlug);

// [COUPONS]-X
router.get('/coupons/check', couponController.handleCheckCoupon);


// [PUBLIC - CHATBOT AI]-X
router.post('/chatbot/message', chatbotController.handleChatbotMessage);
router.get('/chatbot/history', chatbotController.handleGetChatHistory);

//  Yêu cầu gửi mã OTP-X
router.post('/auth/forgot-password/send-otp', authController.handleSendOtp);

//  Xác nhận OTP và đặt lại pass-X
router.post('/auth/forgot-password/reset', authController.handleResetPasswordOtp);
module.exports = router;