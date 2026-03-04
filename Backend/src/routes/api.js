const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const categoryController = require('../controllers/categoryController')
const JWTAction = require('../middleware/JWTAction')

router.post('/auth/register', authController.handleRegister);
router.post('/auth/login', authController.handleLogin);
router.post('/auth/logout', authController.handleLogout);
router.post('/auth/refresh', authController.handleRefreshToken);

router.use(JWTAction.checkUserJWT);

router.patch('/auth/change-password', authController.handleChangePassword);

router.get('/user/profile', userController.handleGetUserProfile);
router.put('/user/profile', userController.handleUpdateUserProfile);

router.get('/user/addresses', userController.handleGetUserAddresses);
router.post('/user/addresses', userController.handleCreateUserAddress);
router.put('/user/addresses/:id', userController.handleUpdateUserAddress);
router.delete('/user/addresses/:id', userController.handleDeleteUserAddress);
router.patch('/user/addresses/:id/default', userController.handleSetDefaultAddress);

router.get('/categories', categoryController.handleGetAllCategories);


router.use(JWTAction.checkUserPermission)

router.post('/admin/categories', categoryController.handleCreateCategory);
router.put('/admin/categories/:id', categoryController.handleUpdateCategory);
router.delete('/admin/categories/:id', categoryController.handleDeleteCategory);





module.exports = router