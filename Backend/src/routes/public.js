const express = require('express');
const router = express.Router();
const uploadCloud = require('../config/cloudinary.config');
const { checkReviewToken } = require('../middleware/reviewAuth');
const JWTAction = require('../middleware/JWTAction');
// Lấy các Controller tương ứng
const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const collectionController = require('../controllers/collectionController');
const chatbotController = require('../controllers/chatbotController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const colorController = require('../controllers/colorController');
const sizeController = require('../controllers/sizeController');
const reviewController = require('../controllers/reviewController');


// Public APIs
router.get('/reviews/verify-token', reviewController.verifyReviewLink);
router.get('/products/:id/reviews', reviewController.handleGetProductReviews);
// Protected APIs (Token-based Validation via email link)
// Cho phép upload tối đa 5 ảnh
router.post('/reviews', checkReviewToken, uploadCloud.array('images', 5), reviewController.handleCreateReview);

// [VNPAY CALLBACKS]-X
router.get('/vnpay/ipn', orderController.handleVNPayIPN);
router.get('/vnpay/return', orderController.handleVNPayReturn);
router.post('/order/vnpay-url/guest', orderController.handleGetGuestVNPayUrl);
router.get('/order/guest/:id', orderController.handleGetGuestOrderDetail);
router.post('/order/guest/recover', orderController.handleRecoverGuestOrderIds);

// [COLORS & SIZES]
router.get('/colors', colorController.handleGetAllColors);
router.get('/sizes', sizeController.handleGetAllSizes);



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
router.get('/coupons', couponController.handleGetPublicCoupons);


// [PUBLIC - CHATBOT AI]-X
router.post('/chatbot/message', JWTAction.optionalAuth, chatbotController.handleChatbotMessage);
router.get('/chatbot/history', JWTAction.optionalAuth, chatbotController.handleGetChatHistory);

//  Yêu cầu gửi mã OTP-X
router.post('/auth/forgot-password/send-otp', authController.handleSendOtp);

//  Xác nhận OTP và đặt lại pass-X
router.post('/auth/forgot-password/reset', authController.handleResetPasswordOtp);
module.exports = router;