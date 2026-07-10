const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['starters', 'mains','breads', 'desserts', 'beverages'], required: true },
  price: { type: Number, required: true, min: 0 },
  imageUrl: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  preparationTime: { type: Number, default: 15 },
  allergens: [{ type: String }],
  soldCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
