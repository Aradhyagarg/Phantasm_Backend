const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }] 
}, { timestamps: true });

categorySchema.index({ name: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
