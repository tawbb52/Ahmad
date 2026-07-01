import { Router, Response } from 'express';
import { AuditLog } from '../models/AuditLog';
import { authenticateToken, AuthRequest, authorizeRole } from '../middleware/auth';

const router = Router();

// Get audit logs (admin only)
router.get('/', authenticateToken, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'email fullName')
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
