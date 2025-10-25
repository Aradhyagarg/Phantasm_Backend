const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
}, { timestamps: true });

brandSchema.index({ name: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model('Brand', brandSchema);
