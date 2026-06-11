const express = require('express');
const { body, validationResult } = require('express-validator');
const Room = require('../models/Room');
const Furniture = require('../models/Furniture');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(rooms);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.id, userId: req.user.id });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, [
  body('name').trim().isLength({ min: 1 }).withMessage('Room name required'),
  body('dimensions.width').isFloat({ min: 1, max: 30 }),
  body('dimensions.depth').isFloat({ min: 1, max: 30 }),
  body('dimensions.height').isFloat({ min: 2, max: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const room = await Room.create({ ...req.body, userId: req.user.id });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body, userId: req.user.id },
      { new: true, runValidators: true }
    );
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json({ message: 'Room deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// AI text-to-room: parse a natural language description and create a room config
router.post('/generate', auth, async (req, res) => {
  try {
    const { description = '' } = req.body;
    const lower = description.toLowerCase();

    // Parse dimensions from text (e.g., "12 by 10", "12x10", "12 feet by 10")
    let width = 5, depth = 4, height = 2.7;
    const dimMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:by|x|×)\s*(\d+(?:\.\d+)?)/);
    if (dimMatch) {
      let w = parseFloat(dimMatch[1]), d = parseFloat(dimMatch[2]);
      // Convert feet to metres if mentioned
      if (lower.includes('feet') || lower.includes('ft') || lower.includes("'")) {
        w = w * 0.3048; d = d * 0.3048;
      }
      width = Math.min(Math.max(w, 2), 20);
      depth = Math.min(Math.max(d, 2), 20);
    }
    const heightMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:m|meter|metre)\s*(?:high|tall|ceiling)/);
    if (heightMatch) height = Math.min(Math.max(parseFloat(heightMatch[1]), 2), 6);

    // Parse room type
    const roomTypes = ['bedroom', 'living', 'dining', 'office', 'kitchen'];
    const roomType = roomTypes.find(t => lower.includes(t)) || 'living';

    // Parse style
    const styles = ['minimalist', 'modern', 'cozy', 'luxury', 'industrial', 'scandinavian'];
    const stylePreference = styles.find(s => lower.includes(s)) || 'modern';

    // Parse budget
    const budget = lower.includes('luxury') || lower.includes('premium') || lower.includes('high-end') ? 'premium'
      : lower.includes('budget') || lower.includes('cheap') || lower.includes('affordable') ? 'budget'
      : 'mid-range';

    // Parse wall/floor colors from text
    const colorKeywords = {
      white: '#FFFFFF', cream: '#F5F0EB', beige: '#EDE0CC', grey: '#D0CCC8',
      dark: '#2C2C2C', walnut: '#5C3D2E', wood: '#C4A882', blue: '#C8D8E8',
    };
    let wallColor = '#F5F0EB', floorColor = '#C4A882';
    Object.entries(colorKeywords).forEach(([keyword, color]) => {
      if (lower.includes(`${keyword} wall`)) wallColor = color;
      if (lower.includes(`${keyword} floor`)) floorColor = color;
    });

    // Parse room name from description
    const nameMatch = description.match(/called?\s+["']?([A-Z][^"'.,!?]{1,30})["']?/i);
    const name = nameMatch ? nameMatch[1].trim() : `${stylePreference.charAt(0).toUpperCase() + stylePreference.slice(1)} ${roomType.charAt(0).toUpperCase() + roomType.slice(1)}`;

    const room = await Room.create({
      userId: req.user.id,
      name,
      dimensions: { width: parseFloat(width.toFixed(1)), depth: parseFloat(depth.toFixed(1)), height: parseFloat(height.toFixed(1)) },
      roomType,
      stylePreference,
      budget,
      style: { wallColor, floorColor, ceilingColor: '#FFFFFF', wallMaterial: 'paint', floorType: 'hardwood' },
    });

    // Get recommended furniture for this room
    const budgetLimits = { budget: 300, 'mid-range': 800, premium: 99999 };
    const maxPrice = budgetLimits[budget];
    const suggested = await Furniture.find({
      inStock: true,
      price: { $lte: maxPrice },
      $or: [{ styleTags: stylePreference }, { roomTypes: roomType }],
    }).sort({ rating: -1 }).limit(6);

    res.status(201).json({ room, suggestedFurniture: suggested });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during room generation' });
  }
});

module.exports = router;
