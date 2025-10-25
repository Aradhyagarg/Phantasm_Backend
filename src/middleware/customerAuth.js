const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

exports.protectCustomer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) return res.status(401).json({ message: 'Invalid token' });

    req.customer = customer;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
