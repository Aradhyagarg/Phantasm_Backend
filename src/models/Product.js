const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, trim: true },
  description: { type: String },
  price: { type: Number, required: true },
  status: { type: String, enum: ['active','inactive'], default: 'active' },
  images: { type: [String], default: [] },         
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  stores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

productSchema.index({ sku: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model('Product', productSchema);
