const express = require('express');
const router = express.Router();

const publicRoutes = require('./public');
const userRoutes = require('./user');
const adminRoutes = require('./admin');

router.use('/', publicRoutes);
router.use('/', userRoutes);
router.use('/', adminRoutes);

module.exports = router;