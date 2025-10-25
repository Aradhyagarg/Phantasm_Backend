const express = require('express');
const { getCart, addOrUpdateItem, updateItemQuantity, removeItem, clearCart } = require('../controllers/cartController');
const { protectCustomer } = require('../middleware/customerAuth');

const router = express.Router();

router.get('/', protectCustomer, getCart);
router.post('/items', protectCustomer, addOrUpdateItem);
router.put('/items/:itemId', protectCustomer, updateItemQuantity);
router.delete('/items/:itemId', protectCustomer, removeItem);
router.delete('/', protectCustomer, clearCart);

module.exports = router;