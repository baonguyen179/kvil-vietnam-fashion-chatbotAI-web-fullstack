const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController');
const JWTAction = require('../middleware/JWTAction')

router.post('/auth/register', authController.handleRegister);
router.post('/auth/login', authController.handleLogin);

router.use(JWTAction.checkUserJWT);



// router.use(JWTAction.checkUserPermission)




module.exports = router