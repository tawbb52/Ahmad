import { Router, Response } from 'express';
import { User } from '../models/User';
import { authenticateToken, AuthRequest, authorizeRole } from '../middleware/auth';

const router = Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userRole !== 'admin' && req.userId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.userRole !== 'admin' && req.userId !== req.params.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { fullName, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { fullName: fullName !== undefined ? String(fullName) : undefined, email: email !== undefined ? String(email) : undefined },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
