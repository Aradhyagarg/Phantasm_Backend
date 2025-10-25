const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');

const TAX_PERCENT = parseFloat(process.env.TAX_PERCENT || '0');

exports.createOrderFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.customer._id }).populate('items.product items.store');
    if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    let subtotal = 0;
    const items = [];
    for (const it of cart.items) {
      const product = await Product.findById(it.product._id);
      if (!product) return res.status(400).json({ message: `Product ${it.product._id} not found` });
      const available = (product.stores || []).some(s => s.toString() === it.store._id.toString());
      if (!available) return res.status(400).json({ message: `Product ${product._id} not available in store ${it.store._id}` });

      const price_snapshot = product.price;
      const line = {
        product: product._id,
        store: it.store._id,
        quantity: it.quantity,
        price_snapshot
      };
      items.push(line);
      subtotal += (price_snapshot * it.quantity);
    }

    const tax = +(subtotal * (TAX_PERCENT / 100));
    const total = +(subtotal + tax);

    const order = await Order.create({
      customer: req.customer._id,
      items,
      subtotal,
      tax,
      total,
      status: 'PAYMENT_PENDING'
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({ message: 'Order created', order });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product items.store');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) { res.status(500).json({ message: err.message }); }
};