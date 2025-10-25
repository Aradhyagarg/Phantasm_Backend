const { validationResult } = require('express-validator');
const Category = require('../models/Category');

exports.createCategory = async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name, stores } = req.body;
    const createdBy = req.user._id;

    const category = await Category.create({ name, createdBy, stores: stores || [] });
    res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Category name already exists for this account' });
    res.status(500).json({ message: err.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const { store_id } = req.query;
    const filter = { createdBy: req.user ? req.user._id : undefined };
    if (store_id) filter.stores = store_id;

    Object.keys(filter).forEach(k => filter[k] === undefined && delete filter[k]);

    const categories = await Category.find(filter).sort({ name: 1 });
    res.json({ count: categories.length, categories });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ category });
  } catch (err) { res.status(500).json({ message: err.message }); }
};