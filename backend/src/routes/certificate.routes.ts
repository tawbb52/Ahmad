import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { Certificate } from '../models/Certificate';
import { AuditLog } from '../models/AuditLog';
import { authenticateToken, AuthRequest, authorizeRole } from '../middleware/auth';

const router = Router();

// Get all certificates
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};
    if (req.userRole !== 'admin') {
      query.userId = req.userId;
    }

    const certificates = await Certificate.find(query).populate('userId', 'email fullName');
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Create certificate
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { certificateData, expiryDate } = req.body;

    const certificate = new Certificate({
      userId: req.userId,
      certificateData,
      expiryDate,
    });

    await certificate.save();

    // Log audit
    await AuditLog.create({
      userId: req.userId,
      action: 'CREATE',
      resourceType: 'Certificate',
      resourceId: certificate._id,
    });

    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create certificate' });
  }
});

// Get certificate by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const certificate = await Certificate.findById(req.params.id).populate('userId', 'email fullName');

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (req.userRole !== 'admin' && certificate.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(certificate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

// Update certificate
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (req.userRole !== 'admin' && certificate.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { expiryDate, status } = req.body;
    const certId = new Types.ObjectId(req.params.id);
    const updateFields: Record<string, unknown> = {};
    if (expiryDate !== undefined) updateFields.expiryDate = new Date(String(expiryDate));
    if (status !== undefined) updateFields.status = String(status);
    const updatedCert = await Certificate.findByIdAndUpdate(certId, updateFields, {
      new: true,
    });

    await AuditLog.create({
      userId: req.userId,
      action: 'UPDATE',
      resourceType: 'Certificate',
      resourceId: certificate._id,
    });

    res.json(updatedCert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update certificate' });
  }
});

// Revoke certificate
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (req.userRole !== 'admin' && certificate.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Certificate.updateOne(
      { _id: req.params.id },
      { status: 'revoked', revokedAt: new Date() }
    );

    await AuditLog.create({
      userId: req.userId,
      action: 'REVOKE',
      resourceType: 'Certificate',
      resourceId: certificate._id,
    });

    res.json({ message: 'Certificate revoked successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke certificate' });
  }
});

// Validate certificate
router.post('/validate', async (req, res: Response) => {
  try {
    const { certificateData } = req.body;
    const certificate = await Certificate.findOne({ certificateData: String(certificateData) });

    if (!certificate) {
      return res.json({ valid: false });
    }

    const isExpired = new Date() > certificate.expiryDate;
    const isRevoked = certificate.status === 'revoked';

    res.json({
      valid: !isExpired && !isRevoked,
      status: certificate.status,
      expiryDate: certificate.expiryDate,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate certificate' });
  }
});

export default router;
