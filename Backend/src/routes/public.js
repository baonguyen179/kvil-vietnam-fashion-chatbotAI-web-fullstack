const express = require('express');
const router = express.Router();

// Lấy các Controller tương ứng
const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const collectionController = require('../controllers/collectionController');

// [AUTH]
router.post('/auth/register', authController.handleRegister);
router.post('/auth/login', authController.handleLogin);
router.post('/auth/logout', authController.handleLogout);
router.post('/auth/refresh', authController.handleRefreshToken);

// [CATEGORIES & PRODUCTS]
router.get('/categories', categoryController.handleGetAllCategories);
router.get('/products', productController.handleGetAllProducts);
router.get('/products/search', productController.handleSearchProducts);
router.get('/products/:id', productController.handleGetProductById);

// [COLLECTIONS]
router.get('/collections', collectionController.handleGetPublicCollections);
router.get('/collections/:slug', collectionController.handleGetCollectionBySlug);

module.exports = router;