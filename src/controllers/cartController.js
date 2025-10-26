const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Store = require('../models/Store');

const validateProductInStore = async (productId, storeId) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');
  const found = (product.stores || []).some(s => s.toString() === storeId.toString());
  if (!found) throw new Error('Product not available in selected store');
  return product;
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.customer._id }).populate('items.product items.store');
    if (!cart) return res.json({ items: [] });
    res.json({ cart });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.addOrUpdateItem = async (req, res) => {
    try {
      const { product: productId, store: storeId, quantity } = req.body;
      if (!productId || !storeId || !quantity)
        return res.status(400).json({ message: 'product, store and quantity required' });
  
      const product = await validateProductInStore(productId, storeId);
      const price_snapshot = product.price;
  
      let cart = await Cart.findOne({ customer: req.customer._id });
      if (!cart) {
        cart = await Cart.create({ customer: req.customer._id, items: [] });
      }
  
      const idx = cart.items.findIndex(
        (it) => it.product.toString() === productId && it.store.toString() === storeId
      );
  
      if (idx > -1) {
        cart.items[idx].quantity = quantity;
        cart.items[idx].price_snapshot = price_snapshot;
      } else {
        cart.items.push({ product: productId, store: storeId, quantity, price_snapshot });
      }
  
      cart.updatedAt = Date.now();
      await cart.save();
  
      await cart.populate([{ path: 'items.product' }, { path: 'items.store' }]);
  
      res.json({ message: 'Cart updated', cart });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  

exports.updateItemQuantity = async (req, res) => {
    try {
      const itemId = req.params.itemId;
      const { quantity } = req.body;
      if (!quantity) return res.status(400).json({ message: 'quantity required' });
  
      const cart = await Cart.findOne({ customer: req.customer._id });
      if (!cart) return res.status(404).json({ message: 'Cart not found' });
  
      const item = cart.items.id(itemId);
      if (!item) return res.status(404).json({ message: 'Cart item not found' });
  
      await validateProductInStore(item.product, item.store);
  
      item.quantity = quantity;
      cart.updatedAt = Date.now();
      await cart.save();
  
      await cart.populate([{ path: 'items.product' }, { path: 'items.store' }]);
  
      res.json({ message: 'Item updated', cart });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };  

  exports.removeItem = async (req, res) => {
    try {
      const itemId = req.params.itemId;
      const cart = await Cart.findOne({ customer: req.customer._id });
      if (!cart) return res.status(404).json({ message: 'Cart not found' });
  
      const item = cart.items.id(itemId);
      if (!item) return res.status(404).json({ message: 'Cart item not found' });
  
      cart.items = cart.items.filter(i => i._id.toString() !== itemId);
  
      cart.updatedAt = Date.now();
      await cart.save();
  
      res.json({ message: 'Item removed', cart });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ customer: req.customer._id });
    if (!cart) return res.json({ message: 'Cart empty' });

    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();
    res.json({ message: 'Cart cleared' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};