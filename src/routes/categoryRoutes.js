const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protectAdmin } = require('../middleware/auth');
const { createCategory, getAllCategories, getCategoryById } = require('../controllers/categoryController');

router.post('/', protectAdmin, body('name').notEmpty().withMessage('Name required'), createCategory);
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

module.exports = router;