const express = require('express');
const { body } = require('express-validator');
const { createStore, getAllStores, getStoreById, nearbyStores } = require('../controllers/storeController');
const { protectAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', protectAdmin,
  [
    body('name').notEmpty(),
    body('code').notEmpty(),
    body('latitude').notEmpty(),
    body('longitude').notEmpty()
  ],
  createStore
);

router.get('/', getAllStores);
router.get('/nearby', nearbyStores); 
router.get('/:id', getStoreById);

module.exports = router;