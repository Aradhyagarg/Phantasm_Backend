const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protectAdmin } = require('../middleware/auth');
const { upload } = require('../config/multer');
const {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory
} = require('../controllers/productController');

router.post(
  '/',
  protectAdmin,
  upload.array('images', 5),
  [
    body('name').notEmpty(),
    body('sku').notEmpty(),
    body('price').isNumeric(),
    body('brand').notEmpty(),
    body('categories').isArray({ min: 1 })
  ],
  createProduct
);

router.get('/', getAllProducts);

router.get('/:id', getProductById);

router.get('/category/:categoryId', getProductsByCategory);

module.exports = router;