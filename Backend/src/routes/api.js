const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController');
const JWTAction = require('../middleware/JWTAction')

router.post('/auth/register', authController.handleRegister);
router.post('/auth/login', authController.handleLogin);
router.post('/auth/logout', authController.handleLogout);
router.post('/auth/refresh', authController.handleRefreshToken);

router.use(JWTAction.checkUserJWT);

router.patch('/auth/change-password', authController.handleChangePassword);

// router.use(JWTAction.checkUserPermission)




module.exports = router