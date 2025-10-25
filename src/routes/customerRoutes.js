const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getProfile,
  updateAddress
} = require('../controllers/customerController');
const { protectCustomer } = require('../middleware/customerAuth');

const router = express.Router();

// Register
router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').notEmpty()
], register);

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], login);

// Protected
router.get('/profile', protectCustomer, getProfile);
router.put('/profile/address', protectCustomer, updateAddress);

module.exports = router;