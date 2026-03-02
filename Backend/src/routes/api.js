const express = require('express')
const router = express.Router()
const apiController = require('../controllers/apiController')

router.get('/', apiController.getHomePage)
router.post('/user',apiController.createNewUser)
router.patch('/user/:id',apiController.updateUser)
router.delete('/user/:id',apiController.deleteUser)

module.exports = router