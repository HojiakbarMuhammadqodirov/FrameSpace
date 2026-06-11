const express = require('express');
const router = express.Router();

const TEMPLATES = [
  {
    id: 'cozy-studio',
    name: 'Cozy Studio',
    description: 'Warm, compact studio space optimized for comfort and relaxation.',
    roomType: 'living',
    stylePreference: 'cozy',
    budget: 'mid-range',
    dimensions: { width: 4.5, depth: 4, height: 2.7 },
    style: { wallColor: '#F0E8DC', floorColor: '#A0896A', ceilingColor: '#FAFAF8' },
    thumbnail: 'cozy',
  },
  {
    id: 'minimalist-office',
    name: 'Minimalist Office',
    description: 'Clean, distraction-free workspace with plenty of natural light.',
    roomType: 'office',
    stylePreference: 'minimalist',
    budget: 'mid-range',
    dimensions: { width: 3.5, depth: 3, height: 2.7 },
    style: { wallColor: '#FFFFFF', floorColor: '#C8C4BC', ceilingColor: '#FFFFFF' },
    thumbnail: 'office',
  },
  {
    id: 'scandinavian-bedroom',
    name: 'Scandinavian Bedroom',
    description: 'Light and airy Nordic-inspired bedroom for restful sleep.',
    roomType: 'bedroom',
    stylePreference: 'scandinavian',
    budget: 'mid-range',
    dimensions: { width: 4, depth: 4.5, height: 2.7 },
    style: { wallColor: '#F5F0EB', floorColor: '#D4C4B0', ceilingColor: '#FFFFFF' },
    thumbnail: 'bedroom',
  },
  {
    id: 'industrial-loft',
    name: 'Industrial Loft',
    description: 'Raw, urban aesthetic with exposed materials and high ceilings.',
    roomType: 'living',
    stylePreference: 'industrial',
    budget: 'premium',
    dimensions: { width: 6, depth: 5, height: 3.2 },
    style: { wallColor: '#D0C8BC', floorColor: '#4A4A4A', ceilingColor: '#E8E0D8' },
    thumbnail: 'industrial',
  },
  {
    id: 'luxury-dining',
    name: 'Luxury Dining',
    description: 'Elegant dining room designed for memorable dinner parties.',
    roomType: 'dining',
    stylePreference: 'luxury',
    budget: 'premium',
    dimensions: { width: 5, depth: 4, height: 2.8 },
    style: { wallColor: '#EDE4D8', floorColor: '#6B5B45', ceilingColor: '#F8F4EE' },
    thumbnail: 'dining',
  },
  {
    id: 'modern-open-plan',
    name: 'Modern Open Plan',
    description: 'Spacious modern layout combining living and dining in one flow.',
    roomType: 'living',
    stylePreference: 'modern',
    budget: 'mid-range',
    dimensions: { width: 7, depth: 5, height: 2.7 },
    style: { wallColor: '#F2EEE8', floorColor: '#8B7355', ceilingColor: '#FFFFFF' },
    thumbnail: 'modern',
  },
];

router.get('/', (req, res) => res.json(TEMPLATES));
router.get('/:id', (req, res) => {
  const t = TEMPLATES.find(t => t.id === req.params.id);
  if (!t) return res.status(404).json({ message: 'Template not found' });
  res.json(t);
});

module.exports = router;
