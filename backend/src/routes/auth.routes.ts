import { Router, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

const generateTokens = (userId: string, role: string) => {
  const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: (process.env.JWT_EXPIRY || '7d') as any }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    { expiresIn: (process.env.JWT_REFRESH_EXPIRY || '30d') as any }
  );

  return { token, refreshToken };
};

// Register
router.post('/register', async (req, res: Response) => {
  try {
    const { email, password, fullName } = req.body;
    const sanitizedEmail = String(email);

    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({ email: sanitizedEmail, password, fullName });
    await user.save();

    const { token, refreshToken } = generateTokens(user._id.toString(), user.role);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user._id, email: user.email, role: user.role },
      token,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    const sanitizedEmail = String(email);

    const user = await User.findOne({ email: sanitizedEmail });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { token, refreshToken } = generateTokens(user._id.toString(), user.role);

    res.json({
      message: 'Login successful',
      user: { id: user._id, email: user.email, role: user.role },
      token,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Refresh Token
router.post('/refresh', (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh_secret'
    ) as any;

    const token = jwt.sign(
      { userId: decoded.userId, role: decoded.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: (process.env.JWT_EXPIRY || '7d') as any }
    );

    res.json({ token });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

export default router;
