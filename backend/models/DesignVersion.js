const mongoose = require('mongoose');

const placedSchema = new mongoose.Schema({
  furnitureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Furniture' },
  name: String,
  position: { x: Number, y: Number, z: Number },
  rotation: Number,
  scale: Number,
  color: String,
  material: String,
}, { _id: true });

const designVersionSchema = new mongoose.Schema({
  designId: { type: mongoose.Schema.Types.ObjectId, ref: 'Design', required: true, index: true },
  versionNumber: { type: Number, required: true },
  name: { type: String, required: true },
  furnitureLayout: [placedSchema],
  totalCost: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'savedAt', updatedAt: false } });

designVersionSchema.index({ designId: 1, versionNumber: -1 });

module.exports = mongoose.model('DesignVersion', designVersionSchema);
