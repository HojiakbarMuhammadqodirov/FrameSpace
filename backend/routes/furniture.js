const express = require('express');
const Furniture = require('../models/Furniture');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, style, budget, search, limit = 50, page = 1 } = req.query;
    const query = { inStock: true };

    if (category) query.category = category;
    if (style) query.styleTags = { $in: [style] };
    if (budget) query.priceRange = budget;
    if (search) query.name = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      Furniture.find(query).skip(skip).limit(parseInt(limit)).sort({ rating: -1 }),
      Furniture.countDocuments(query),
    ]);

    res.json({ items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Furniture.distinct('category');
    res.json(categories);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Furniture.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Furniture not found' });
    res.json(item);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// Rule-based recommendation engine
router.post('/recommend', async (req, res) => {
  try {
    const { room, preferences } = req.body;
    const { dimensions, windows = [], stylePreference, budget, roomType } = room;
    const { style = stylePreference, budgetRange = budget } = preferences || {};

    const area = dimensions.width * dimensions.depth;
    const lightLevel = windows.length;

    const budgetLimits = { budget: 300, 'mid-range': 800, premium: 999999 };
    const maxPrice = budgetLimits[budgetRange] || budgetLimits['mid-range'];

    // Priority categories by room type
    const priorityCategories = {
      living: ['sofa', 'tv-stand', 'table', 'chair', 'rug', 'lighting', 'plant'],
      bedroom: ['bed', 'wardrobe', 'desk', 'lighting', 'rug', 'plant'],
      dining: ['table', 'chair', 'lighting', 'rug', 'plant'],
      office: ['desk', 'chair', 'shelf', 'lighting', 'plant'],
      kitchen: ['table', 'chair', 'lighting', 'storage'],
    };

    const priority = priorityCategories[roomType] || priorityCategories.living;

    // Fetch candidate furniture
    const styleQuery = style ? { $in: [style, 'versatile'] } : { $exists: true };
    const candidates = await Furniture.find({
      inStock: true,
      price: { $lte: maxPrice },
      styleTags: styleQuery,
    });

    // Score each item
    const scored = candidates.map(item => {
      let score = 0;

      // Style match
      if (style && item.styleTags.includes(style)) score += 30;
      if (item.styleTags.includes('versatile')) score += 10;

      // Category priority
      const catIndex = priority.indexOf(item.category);
      if (catIndex !== -1) score += (priority.length - catIndex) * 8;

      // Room type match
      if (item.roomTypes.includes(roomType)) score += 20;

      // Size appropriateness
      const itemFootprint = (item.dimensions.width / 100) * (item.dimensions.depth / 100);
      const ratio = itemFootprint / area;
      if (ratio < 0.10) score += 25;
      else if (ratio < 0.20) score += 18;
      else if (ratio < 0.30) score += 10;
      else score -= 10;

      // Lighting preference (bright rooms suit light-colored items)
      if (lightLevel >= 2 && item.colors.some(c => ['white', 'cream', 'beige', 'light grey'].includes(c.toLowerCase()))) score += 8;
      if (lightLevel < 2 && item.colors.some(c => ['walnut', 'oak', 'dark grey', 'navy'].includes(c.toLowerCase()))) score += 8;

      // Budget efficiency
      if (item.price <= maxPrice * 0.5) score += 5;

      // Rating
      score += (item.rating - 3) * 5;

      return { ...item.toObject(), score, reason: generateReason(item, style, area, lightLevel) };
    });

    // Sort and return top 12, ensuring variety across categories
    const sorted = scored.sort((a, b) => b.score - a.score);
    const seen = new Set();
    const result = [];
    for (const item of sorted) {
      if (result.length >= 12) break;
      const key = item.category;
      if (!seen.has(key) || seen.size >= priority.length) {
        result.push(item);
        seen.add(key);
      }
    }

    // Fill remaining slots
    for (const item of sorted) {
      if (result.length >= 12) break;
      if (!result.find(r => r._id.toString() === item._id.toString())) result.push(item);
    }

    res.json(result.slice(0, 12));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during recommendation' });
  }
});

function generateReason(item, style, area, lightLevel) {
  const reasons = [];
  if (style && item.styleTags.includes(style)) reasons.push(`Matches your ${style} style`);
  const footprint = (item.dimensions.width / 100) * (item.dimensions.depth / 100);
  const ratio = footprint / area;
  if (ratio < 0.15) reasons.push('Perfect size for your room');
  else if (ratio < 0.25) reasons.push('Good fit for your space');
  if (lightLevel >= 2 && item.colors.some(c => ['white', 'cream', 'beige'].includes(c.toLowerCase()))) {
    reasons.push('Light color maximizes natural light');
  }
  if (item.rating >= 4.5) reasons.push('Highly rated by customers');
  return reasons.join(' · ') || 'Great addition to your room';
}

module.exports = router;
