const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

const genToken = (customer) => {
  return jwt.sign(
    { id: customer._id, email: customer.email, type: 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, phone } = req.body;

    const existing = await Customer.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Customer already exists' });

    const customer = await Customer.create({ name, email, password, phone });

    res.status(201).json({ message: 'Customer registered', customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await customer.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = genToken(customer);
    const { password: _, ...customerData } = customer.toObject();

    res.json({ message: 'Login successful', token, customer: customerData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id).select('-password');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { address, latitude, longitude } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.customer.id,
      { address, latitude, longitude },
      { new: true }
    ).select('-password');

    res.json({ message: 'Address updated', customer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
