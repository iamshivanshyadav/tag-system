// posts.js

import express from 'express';
import Post from '../models/post.js';
import authenticateUser from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a post
router.post('/', authenticateUser, async (req, res) => {
  const { title, content, tags } = req.body;
  const { userId } = req.user; // Get user role and ID from decoded token

  try {

    
      const post = new Post({
        title,
        content,
        tags,
        author: userId // Assign the current user as the author of the post
      });

      const newPost = await post.save();
      return res.status(201).json(newPost);
    


  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a post
router.patch('/:id', authenticateUser, async (req, res) => {
  const { title, content, tags } = req.body;
  const {userId } = req.user; // Get user role and ID from decoded token

  try {
    const post = await Post.findById(req.params.id);

    // Check if post exists
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Regular users can only edit their own posts
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied. You can only edit your own posts' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.tags = tags || post.tags;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a post
router.delete('/:id', authenticateUser, async (req, res) => {
  const { role, userId } = req.user; // Get user role and ID from decoded token

  try {
    const post = await Post.findById(req.params.id);

    // Check if post exists
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only admins or the author of the post can delete it
    if (role === 'admin' || post.author.toString() === userId) {
       await Post.findOneAndDelete({ _id: req.params.id });
      return res.json({ message: 'Post deleted' });
    }

    return res.status(403).json({ message: 'Access denied. Only admins or the author of the post can delete it' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
