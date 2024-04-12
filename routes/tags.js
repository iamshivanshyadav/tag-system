// tags.js

import express from 'express';
import Tag from '../models/tag.js';
import authenticateUser from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all tags
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a tag
router.post('/', authenticateUser, async (req, res) => {
  const { name } = req.body;
  const { userId } = req.user; // Get user ID from decoded token

  try {
    const tag = new Tag({ name, createdBy: userId });
    await tag.save();

    res.status(201).json(tag);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a tag
router.patch('/:id', authenticateUser, async (req, res) => {
  const { name } = req.body;
  const { userId, role } = req.user; // Get user ID and role from decoded token

  try {
    const tag = await Tag.findById(req.params.id);

    // Check if tag exists
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Regular users can only edit their own tags
    if (role === 'admin' || tag.createdBy.toString() === userId) {
       tag.name = name || tag.name;

    const updatedTag = await tag.save();
    res.json(updatedTag);      
    }

    return res.status(403).json({ message: 'Access denied. You can only edit your own tags' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a tag
router.delete('/:id', authenticateUser, async (req, res) => {
  const { userId, role } = req.user; // Get user ID and role from decoded token

  try {
    const tag = await Tag.findById(req.params.id);

    // Check if tag exists
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    if (role === 'admin' || tag.createdBy.toString() === userId) {
        await Tag.findOneAndDelete({ _id: req.params.id });
      return res.json({ message: 'Tag deleted' });
     
    }

  return res.status(403).json({ message: 'Access denied. You can only delete your own tags' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
 