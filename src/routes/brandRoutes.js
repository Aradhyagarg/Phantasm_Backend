const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protectAdmin } = require('../middleware/auth');
const { createBrand, getAllBrands, getBrandById } = require('../controllers/brandController');

router.post('/', protectAdmin, body('name').notEmpty().withMessage('Name required'), createBrand);
router.get('/', getAllBrands);
router.get('/:id', getBrandById);

module.exports = router;