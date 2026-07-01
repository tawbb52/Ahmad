import { Router, Response } from 'express';
import { UDID } from '../models/UDID';
import { AuditLog } from '../models/AuditLog';
import { authenticateToken, AuthRequest, authorizeRole } from '../middleware/auth';

const router = Router();

// Get all UDIDs
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};
    if (req.userRole !== 'admin') {
      query.userId = req.userId;
    }

    const udids = await UDID.find(query).populate('userId', 'email fullName');
    res.json(udids);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch UDIDs' });
  }
});

// Register UDID
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { udid, deviceName, deviceType } = req.body;

    const existingUDID = await UDID.findOne({ udid });
    if (existingUDID) {
      return res.status(400).json({ error: 'UDID already registered' });
    }

    const newUDID = new UDID({
      userId: req.userId,
      udid,
      deviceName,
      deviceType,
    });

    await newUDID.save();

    // Log audit
    await AuditLog.create({
      userId: req.userId,
      action: 'REGISTER',
      resourceType: 'UDID',
      resourceId: newUDID._id,
    });

    res.status(201).json(newUDID);
  } catch (error) {
    res.status(500).json({ error: 'Failed to register UDID' });
  }
});

// Get UDID by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const udidRecord = await UDID.findById(req.params.id).populate('userId', 'email fullName');

    if (!udidRecord) {
      return res.status(404).json({ error: 'UDID not found' });
    }

    if (req.userRole !== 'admin' && udidRecord.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(udidRecord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch UDID' });
  }
});

// Update UDID
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const udidRecord = await UDID.findById(req.params.id);

    if (!udidRecord) {
      return res.status(404).json({ error: 'UDID not found' });
    }

    if (req.userRole !== 'admin' && udidRecord.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedUDID = await UDID.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    await AuditLog.create({
      userId: req.userId,
      action: 'UPDATE',
      resourceType: 'UDID',
      resourceId: udidRecord._id,
    });

    res.json(updatedUDID);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update UDID' });
  }
});

// Delete UDID
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const udidRecord = await UDID.findById(req.params.id);

    if (!udidRecord) {
      return res.status(404).json({ error: 'UDID not found' });
    }

    if (req.userRole !== 'admin' && udidRecord.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await UDID.deleteOne({ _id: req.params.id });

    await AuditLog.create({
      userId: req.userId,
      action: 'DELETE',
      resourceType: 'UDID',
      resourceId: udidRecord._id,
    });

    res.json({ message: 'UDID deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete UDID' });
  }
});

// Validate UDID
router.post('/validate', async (req, res: Response) => {
  try {
    const { udid } = req.body;
    const udidRecord = await UDID.findOne({ udid });

    if (!udidRecord) {
      return res.json({ valid: false, message: 'UDID not found' });
    }

    res.json({
      valid: udidRecord.isActive,
      deviceName: udidRecord.deviceName,
      deviceType: udidRecord.deviceType,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate UDID' });
  }
});

export default router;
