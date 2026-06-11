const mongoose = require('mongoose');

const furnitureSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['sofa', 'chair', 'table', 'bed', 'desk', 'storage', 'lighting', 'rug', 'plant', 'decor', 'shelf', 'wardrobe', 'tv-stand'],
    required: true,
  },
  price: { type: Number, required: true },
  priceRange: { type: String, enum: ['budget', 'mid-range', 'premium'] },
  image: { type: String, default: '' },
  dimensions: {
    width: { type: Number, required: true },  // cm
    depth: { type: Number, required: true },  // cm
    height: { type: Number, required: true }, // cm
  },
  colors: [{ type: String }],
  materials: [{ type: String }],
  styleTags: [{ type: String }],
  roomTypes: [{ type: String }],
  source: { type: String, default: 'IKEA' },
  sourceUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  rating: { type: Number, default: 4.0, min: 1, max: 5 },
  inStock: { type: Boolean, default: true },
}, { timestamps: true });

furnitureSchema.index({ category: 1, price: 1 });
furnitureSchema.index({ styleTags: 1 });

module.exports = mongoose.model('Furniture', furnitureSchema);
