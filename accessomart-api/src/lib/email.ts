import nodemailer from 'nodemailer';

const isDev = process.env.NODE_ENV !== 'production';

// Initialize transporter if SMTP variables exist
// otherwise we fallback to logging
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) {
    if (isDev) {
      console.log('⚠️ [Email Service] SMTP configuration missing. Falling back to local console mock layer.');
      return null;
    } else {
      console.error('❌ [Email Service] CRITICAL: SMTP is not configured in production environment.');
      return null;
    }
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

// Helper to actually send the email or fallback to console simulation
const sendMail = async (options: nodemailer.SendMailOptions) => {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Accessomart Support" <noreply@accessomart.com>',
        ...options,
      });
      console.log(`[Email Service] ✔️ Successfully sent email to ${options.to}`);
    } catch (err) {
      console.error(`[Email Service] ❌ Failed to send email to ${options.to}:`, err);
    }
  } else {
    // Development Mock Layer
    console.log('\n================== 📧 MOCK EMAIL DISPATCH 📧 ==================');
    console.log(`[To]: ${options.to}`);
    console.log(`[Subject]: ${options.subject}`);
    console.log(`[HTML Body]:\n${options.html}`);
    console.log('===============================================================\n');
  }
};

/**
 * Ships a registration confirmation / welcome email
 */
export const sendVerificationEmail = async (email: string, token: string) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Welcome to Accessomart!</h2>
      <p>Thank you for joining our platform. We're excited to have you.</p>
      <p>To fully activate your account and start browsing premium tech gear, please verify your email address by clicking the securely encrypted link below:</p>
      <div style="margin: 32px 0;">
        <a href="${verifyUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify My Account</a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${verifyUrl}</p>
      <p>This securely generated link will proactively expire in 24 hours.</p>
    </div>
  `;

  await sendMail({
    to: email,
    subject: 'Accessomart - Verify Your Email Address',
    html,
  });
};

/**
 * Ships a password reset transmission
 */
export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Action Required: Password Reset</h2>
      <p>We received a request indicating that you lost your password for Accessomart.</p>
      <p>Click the securely encrypted link below to choose a new password:</p>
      <div style="margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you did not request a password reset, you can safely ignore this automated message. Your account remains secure.</p>
      <p>This securely generated link will proactively expire in 1 hour.</p>
    </div>
  `;

  await sendMail({
    to: email,
    subject: 'Accessomart - Password Reset Request',
    html,
  });
};

/**
 * Ships an order confirmation receipt after payment clears
 */
export const sendOrderConfirmationEmail = async (email: string, orderNumber: string, metadata: { totalAmount: number; name: string }) => {
  const orderUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${orderNumber}`;
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Order Confirmation</h2>
      <p>Hi ${metadata.name},</p>
      <p>Thank you for choosing Accessomart! We've successfully received and secured your order.</p>
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0; font-weight: bold;">Order Number: <span style="font-family: monospace;">${orderNumber}</span></p>
        <p style="margin: 8px 0 0 0;">Total Captured: $${metadata.totalAmount.toFixed(2)}</p>
      </div>
      <p>Our autonomous logistics team is preparing your hardware for shipment. You can track your order status in real-time below:</p>
      <div style="margin: 32px 0;">
        <a href="${orderUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Order Status</a>
      </div>
      <p>We'll notify you as soon as tracking coordinates are assigned.</p>
      <p>Best regards,<br>The Accessomart Protocol Team</p>
    </div>
  `;

  await sendMail({
    to: email,
    subject: `Accessomart - Order Received (${orderNumber})`,
    html,
  });
};
