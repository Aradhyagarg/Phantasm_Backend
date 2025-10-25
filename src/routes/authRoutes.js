const express = require('express');
const { body } = require('express-validator');
const { register, login, getUsers } = require('../controllers/authController');
const { protectAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  body('name').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars')
], register);

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], login);

router.get('/users', protectAdmin, getUsers);

module.exports = router;