const { validationResult } = require('express-validator');
const Brand = require('../models/Brand');

exports.createBrand = async (req, res) => {
  const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name } = req.body;
    const createdBy = req.user._id;

    const brand = await Brand.create({ name, createdBy });
    res.status(201).json({ message: 'Brand created', brand });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Brand name already exists for this account' });
    res.status(500).json({ message: err.message });
  }
};

exports.getAllBrands = async (req, res) => {
  try {
    const filter = req.user ? { createdBy: req.user._id } : {};
    const brands = await Brand.find(filter).sort({ name: 1 });
    res.json({ count: brands.length, brands });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json({ brand });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
