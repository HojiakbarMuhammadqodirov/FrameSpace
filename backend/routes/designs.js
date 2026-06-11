const express = require('express');
const { body, validationResult } = require('express-validator');
const Design = require('../models/Design');
const DesignVersion = require('../models/DesignVersion');
const auth = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Public gallery of shared designs (no auth required)
router.get('/gallery', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [designs, total] = await Promise.all([
      Design.find({ isShared: true })
        .populate('roomId', 'name dimensions roomType')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('name totalCost furnitureLayout roomId updatedAt shareToken userId'),
      Design.countDocuments({ isShared: true }),
    ]);
    res.json({ designs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const designs = await Design.find({ userId: req.user.id })
      .populate('roomId', 'name dimensions style')
      .sort({ updatedAt: -1 });
    res.json(designs);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/shared/:token', async (req, res) => {
  try {
    const design = await Design.findOne({ shareToken: req.params.token, isShared: true })
      .populate('roomId')
      .populate('furnitureLayout.furnitureId');
    if (!design) return res.status(404).json({ message: 'Design not found or not shared' });
    res.json(design);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('roomId')
      .populate('furnitureLayout.furnitureId');
    if (!design) return res.status(404).json({ message: 'Design not found' });
    res.json(design);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, [
  body('name').trim().isLength({ min: 1 }).withMessage('Design name required'),
  body('roomId').isMongoId().withMessage('Valid room ID required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const design = await Design.create({ ...req.body, userId: req.user.id });
    res.status(201).json(design);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const existing = await Design.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existing) return res.status(404).json({ message: 'Design not found' });

    // Auto-save version before overwriting (max 20 versions per design)
    const versionCount = await DesignVersion.countDocuments({ designId: existing._id });
    if (versionCount >= 20) {
      // Remove oldest version
      const oldest = await DesignVersion.findOne({ designId: existing._id }).sort({ versionNumber: 1 });
      if (oldest) await DesignVersion.deleteOne({ _id: oldest._id });
    }
    const latestVersion = await DesignVersion.findOne({ designId: existing._id }).sort({ versionNumber: -1 });
    const nextVersion = (latestVersion?.versionNumber ?? 0) + 1;
    await DesignVersion.create({
      designId: existing._id,
      versionNumber: nextVersion,
      name: existing.name,
      furnitureLayout: existing.furnitureLayout,
      totalCost: existing.totalCost,
    });

    const design = await Design.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body, userId: req.user.id },
      { new: true, runValidators: true }
    );
    res.json(design);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Version history
router.get('/:id/versions', auth, async (req, res) => {
  try {
    const design = await Design.findOne({ _id: req.params.id, userId: req.user.id });
    if (!design) return res.status(404).json({ message: 'Design not found' });
    const versions = await DesignVersion.find({ designId: req.params.id })
      .sort({ versionNumber: -1 })
      .select('-furnitureLayout'); // omit heavy data in listing
    res.json(versions);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/versions/:vId', auth, async (req, res) => {
  try {
    const design = await Design.findOne({ _id: req.params.id, userId: req.user.id });
    if (!design) return res.status(404).json({ message: 'Design not found' });
    const version = await DesignVersion.findById(req.params.vId);
    if (!version || String(version.designId) !== String(design._id)) {
      return res.status(404).json({ message: 'Version not found' });
    }
    res.json(version);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/:id/share', auth, async (req, res) => {
  try {
    const token = crypto.randomBytes(16).toString('hex');
    const design = await Design.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isShared: true, shareToken: token },
      { new: true }
    );
    if (!design) return res.status(404).json({ message: 'Design not found' });
    res.json({ shareToken: token, shareUrl: `${process.env.FRONTEND_URL}/shared/${token}` });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const design = await Design.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!design) return res.status(404).json({ message: 'Design not found' });
    res.json({ message: 'Design deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
