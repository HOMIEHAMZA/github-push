import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { validate } from '../middleware/validate.middleware';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { loginLimiter } from '../middleware/rate-limit.middleware';
import { sendVerificationEmail, sendPasswordResetEmail } from '../lib/email';

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

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

const resendVerificationSchema = z.object({
  email: z.string().email(),
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
authRoutes.post('/register', loginLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await prisma.user.create({
      data: { 
        firstName, 
        lastName, 
        email, 
        passwordHash,
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpires: verificationExpires
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    });

    await sendVerificationEmail(email, verificationToken);

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
authRoutes.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
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

// ─── POST /api/v1/auth/forgot-password ────────────────────────────────────────
authRoutes.post('/forgot-password', loginLimiter, validate(forgotPasswordSchema), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hashedToken,
          passwordResetExpires: new Date(Date.now() + 3600000), // 1 hour
        },
      });

      await sendPasswordResetEmail(email, resetToken);
    }

    // Always return success to avoid leaking user existence
    return res.json({ message: 'If an account with that email exists, a reset link has been generated.' });
  } catch (err) {
    console.error('[Auth:ForgotPassword] Error:', err);
    return res.status(500).json({ error: 'Failed to process password reset request.' });
  }
});

// ─── POST /api/v1/auth/reset-password ───────────────────────────────────────────
authRoutes.post('/reset-password', loginLimiter, validate(resetPasswordSchema), async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      }),
      // Invalidate all refresh tokens for this user
      prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
    ]);

    return res.json({ message: 'Password has been reset successfully. Please log in with your new password.' });
  } catch (err) {
    console.error('[Auth:ResetPassword] Error:', err);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

// ─── POST /api/v1/auth/verify-email ───────────────────────────────────────────
authRoutes.post('/verify-email', validate(verifyEmailSchema), async (req, res) => {
  try {
    const { token } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return res.json({ message: 'Email verified successfully! You now have full access to Accessomart.' });
  } catch (err) {
    console.error('[Auth:VerifyEmail] Error:', err);
    return res.status(500).json({ error: 'Failed to verify email.' });
  }
});

// ─── POST /api/v1/auth/resend-verification ────────────────────────────────────
authRoutes.post('/resend-verification', loginLimiter, validate(resendVerificationSchema), async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && !user.emailVerified) {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: hashedToken,
          emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      await sendVerificationEmail(email, verificationToken);
    }

    // Always return success to avoid leaking user existence
    return res.json({ message: 'If the account is unverified, a new link has been generated.' });
  } catch (err) {
    console.error('[Auth:ResendVerification] Error:', err);
    return res.status(500).json({ error: 'Failed to resend verification link.' });
  }
});
