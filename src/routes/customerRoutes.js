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

router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('phone').notEmpty()
], register);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], login);

router.get('/profile', protectCustomer, getProfile);
router.put('/profile/address', protectCustomer, updateAddress);

module.exports = router;