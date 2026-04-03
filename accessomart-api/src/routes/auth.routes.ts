import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { validate } from '../middleware/validate.middleware';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

export const authRoutes = Router();

// ─── Schemas ──────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateTokens(userId: string, role: string) {
  const accessSecret = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me';

  const accessToken = jwt.sign(
    { userId, role },
    accessSecret,
    { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any }
  );
  const refreshToken = jwt.sign(
    { userId },
    refreshSecret,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any }
  );
  return { accessToken, refreshToken };
}

// ─── POST /api/v1/auth/register ───────────────────────────────────────────────
authRoutes.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { firstName, lastName, email, passwordHash },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error('[Auth:Register] Error:', err);
    return res.status(500).json({ error: 'Failed to create user account. Please try again.' });
  }
});

// ─── POST /api/v1/auth/login ──────────────────────────────────────────────────
authRoutes.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return res.json({ user: safeUser, accessToken, refreshToken });
  } catch (err) {
    console.error('[Auth:Login] Error:', err);
    return res.status(500).json({ error: 'Login failure. Please try again.' });
  }
});

// ─── POST /api/v1/auth/refresh ────────────────────────────────────────────────
authRoutes.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'Refresh token required.' });

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me');
    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) return res.status(401).json({ error: 'User not found.' });

    const tokens = generateTokens(user.id, user.role);
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return res.json(tokens);
  } catch (err) {
    console.error('[Auth:Refresh] Error:', err);
    return res.status(401).json({ error: 'Invalid or expired token sessions.' });
  }
});

// ─── POST /api/v1/auth/logout ─────────────────────────────────────────────────
authRoutes.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    return res.json({ message: 'Logged out.' });
  } catch (err) {
    console.error('[Auth:Logout] Error:', err);
    return res.status(500).json({ error: 'Logout error.' });
  }
});

// ─── GET /api/v1/auth/me ──────────────────────────────────────────────────────
authRoutes.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, avatarUrl: true, role: true, emailVerified: true,
        createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user });
  } catch (err) {
    console.error('[Auth:Me] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});
