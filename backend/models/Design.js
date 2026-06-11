const mongoose = require('mongoose');

const placedFurnitureSchema = new mongoose.Schema({
  furnitureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Furniture', required: true },
  name: { type: String },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
  },
  rotation: { type: Number, default: 0 }, // degrees around Y axis
  scale: { type: Number, default: 1 },
  color: { type: String, default: '' },
  material: { type: String, default: '' },
}, { _id: true });

const designSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  name: { type: String, required: true, trim: true },
  furnitureLayout: [placedFurnitureSchema],
  thumbnail: { type: String, default: '' },
  isShared: { type: Boolean, default: false },
  shareToken: { type: String, default: '' },
  totalCost: { type: Number, default: 0 },
  notes: { type: String, default: '' },
}, { timestamps: true });

designSchema.index({ userId: 1, createdAt: -1 });
designSchema.index({ roomId: 1 });
designSchema.index({ shareToken: 1 }, { sparse: true });

module.exports = mongoose.model('Design', designSchema);
