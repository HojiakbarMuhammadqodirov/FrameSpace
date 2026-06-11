const mongoose = require('mongoose');

const windowSchema = new mongoose.Schema({
  wall: { type: String, enum: ['north', 'south', 'east', 'west'], required: true },
  position: { type: Number, default: 0.5 }, // 0-1 along wall
  width: { type: Number, default: 1.2 }, // meters
  height: { type: Number, default: 1.2 },
  sillHeight: { type: Number, default: 0.9 },
  style: { type: String, enum: ['single', 'double', 'bay', 'sliding'], default: 'single' },
}, { _id: true });

const doorSchema = new mongoose.Schema({
  wall: { type: String, enum: ['north', 'south', 'east', 'west'], required: true },
  position: { type: Number, default: 0.5 },
  width: { type: Number, default: 0.9 },
  style: { type: String, enum: ['single', 'double', 'sliding'], default: 'single' },
}, { _id: true });

const roomSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  shape: { type: String, enum: ['rectangle', 'l-shape', 'square', 'custom'], default: 'rectangle' },
  dimensions: {
    width: { type: Number, required: true, min: 1, max: 30 },
    depth: { type: Number, required: true, min: 1, max: 30 },
    height: { type: Number, required: true, min: 2, max: 6 },
  },
  windows: [windowSchema],
  doors: [doorSchema],
  style: {
    wallColor: { type: String, default: '#F5F0EB' },
    wallMaterial: { type: String, default: 'paint' },
    floorType: { type: String, enum: ['hardwood', 'carpet', 'tile', 'concrete', 'laminate'], default: 'hardwood' },
    floorColor: { type: String, default: '#C4A882' },
    ceilingColor: { type: String, default: '#FFFFFF' },
  },
  roomType: { type: String, enum: ['living', 'bedroom', 'dining', 'office', 'kitchen', 'bathroom'], default: 'living' },
  stylePreference: { type: String, enum: ['minimalist', 'modern', 'cozy', 'luxury', 'industrial', 'scandinavian'], default: 'modern' },
  budget: { type: String, enum: ['budget', 'mid-range', 'premium'], default: 'mid-range' },
}, { timestamps: true });

roomSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Room', roomSchema);
