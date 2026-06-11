const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  preferences: {
    style: { type: String, enum: ['minimalist', 'modern', 'cozy', 'luxury', 'industrial', 'scandinavian'], default: 'modern' },
    budget: { type: String, enum: ['budget', 'mid-range', 'premium'], default: 'mid-range' },
    unit: { type: String, enum: ['meters', 'feet'], default: 'meters' },
  },
  avatar: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
