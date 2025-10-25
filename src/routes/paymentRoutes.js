const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');
const { protectCustomer } = require('../middleware/customerAuth');

router.post('/create/:orderId', protectCustomer, createRazorpayOrder);

module.exports = router;