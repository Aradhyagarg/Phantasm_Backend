const express = require('express');
const { createOrderFromCart, getOrderById } = require('../controllers/orderController');
const { protectCustomer } = require('../middleware/customerAuth');

const router = express.Router();

router.post('/create', protectCustomer, createOrderFromCart);
router.get('/:id', protectCustomer, getOrderById);

module.exports = router;