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
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Make sure STARTTLS is properly handled for port 587:
    requireTLS: process.env.SMTP_SECURE !== 'true',
    // Network robustness for cloud providers like Render
    connectionTimeout: 20000, // 20s
    greetingTimeout: 15000,   // 15s
    socketTimeout: 20000,     // 20s
    // Detailed connection logging for diagnostics
    debug: true,
    logger: true,
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

// ─── SHARED STYLE TOKENS ──────────────────────────────────────────────────────

const BRAND_COLOR = '#6366f1';
const DIVIDER = `<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />`;
const FOOTER = `
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">
    <p style="margin: 0 0 4px 0;">Need help? Contact our support team:</p>
    <p style="margin: 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/support/contact" style="color: ${BRAND_COLOR};">Visit Support Centre</a>
      &nbsp;·&nbsp;
      <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@accessomart.com'}" style="color: ${BRAND_COLOR};">${process.env.SUPPORT_EMAIL || 'support@accessomart.com'}</a>
    </p>
    <p style="margin: 12px 0 0 0;">— The Accessomart Team</p>
  </div>
`;

interface OrderEmailAddress {
  firstName: string;
  lastName: string;
  line1: string;
  line2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country?: string | null;
}

interface OrderEmailItem {
  productName: string;
  variantName: string;
  quantity: number;
  totalPrice: number;
}

/**
 * Builds the order item rows HTML — works with stored OrderItem fields.
 */
const buildItemsHtml = (items: OrderEmailItem[]): string =>
  items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; vertical-align: top;">
        <p style="margin: 0; font-weight: 600; color: #111827;">${item.productName}</p>
        <p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">${item.variantName} &times; ${item.quantity}</p>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right; white-space: nowrap; font-weight: 600; color: #111827;">
        $${Number(item.totalPrice).toFixed(2)}
      </td>
    </tr>
  `).join('');

/**
 * Builds a formatted shipping address block.
 */
const buildAddressHtml = (addr: OrderEmailAddress): string => `
  <p style="margin: 0; line-height: 1.7; color: #374151;">
    ${addr.firstName} ${addr.lastName}<br>
    ${addr.line1}${addr.line2 ? `, ${addr.line2}` : ''}<br>
    ${addr.city}${addr.state ? `, ${addr.state}` : ''} ${addr.postalCode}<br>
    ${addr.country ?? 'US'}
  </p>
`;

/**
 * Order Confirmation Email — sent immediately after a successful payment is captured.
 * Includes: order number, itemised list, totals, shipping address, payment method, support info.
 */
export const sendOrderConfirmationEmail = async (
  email: string,
  orderNumber: string,
  metadata: {
    name: string;
    totalAmount: number;
    items: OrderEmailItem[];
    address?: OrderEmailAddress | null;
    paymentMethod?: string;
  }
) => {
  const orderUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/account/orders`;

  const itemsHtml = buildItemsHtml(metadata.items);

  const addressBlock = metadata.address
    ? `
      <div style="margin: 24px 0;">
        <h3 style="margin: 0 0 10px; font-size: 14px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.05em;">Shipping Address</h3>
        ${buildAddressHtml(metadata.address)}
      </div>
      ${DIVIDER}
    `
    : '';

  const paymentBlock = metadata.paymentMethod
    ? `<p style="margin: 0 0 4px;"><strong>Payment:</strong> ${metadata.paymentMethod}</p>`
    : '';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <div style="background-color: ${BRAND_COLOR}; padding: 28px 32px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Order Confirmed ✓</h1>
        <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Thank you for your order, ${metadata.name}!</p>
      </div>

      <div style="background-color: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px 20px; margin-bottom: 28px;">
          <p style="margin: 0; font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Order Number</p>
          <p style="margin: 4px 0 0; font-family: monospace; font-size: 20px; font-weight: 700; color: #111827;">${orderNumber}</p>
          ${paymentBlock}
        </div>

        <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.05em;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
          <tr>
            <td style="padding: 16px 0 0; font-size: 16px; font-weight: 700; color: #111827;">Order Total</td>
            <td style="padding: 16px 0 0; text-align: right; font-size: 16px; font-weight: 700; color: ${BRAND_COLOR};">$${metadata.totalAmount.toFixed(2)}</td>
          </tr>
        </table>

        ${DIVIDER}
        ${addressBlock}

        <p style="margin: 0 0 24px; color: #374151; font-size: 14px; line-height: 1.6;">
          We are preparing your order for shipment. You'll receive another email with tracking details once your package is on its way.
        </p>

        <a href="${orderUrl}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 14px; text-decoration: none;">
          View My Orders
        </a>

        ${FOOTER}
      </div>
    </div>
  `;

  await sendMail({
    to: email,
    subject: `Accessomart — Order Confirmed: ${orderNumber}`,
    html,
  });
};

/**
 * Shipping Notification Email — sent when an admin marks an order as SHIPPED.
 * Includes: order number, tracking number (optional), estimated delivery info.
 */
export const sendShippingNotificationEmail = async (
  email: string,
  data: {
    name: string;
    orderNumber: string;
    trackingNumber?: string | null;
    carrier?: string | null;
    address?: OrderEmailAddress | null;
  }
) => {
  const orderUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/account/orders`;

  const trackingBlock = data.trackingNumber
    ? `
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px 20px; margin: 24px 0;">
        <p style="margin: 0; font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Tracking Number</p>
        <p style="margin: 4px 0 0; font-family: monospace; font-size: 18px; font-weight: 700; color: #111827;">${data.trackingNumber}</p>
        ${data.carrier ? `<p style="margin: 4px 0 0; font-size: 13px; color: #6b7280;">Carrier: ${data.carrier}</p>` : ''}
      </div>
    `
    : `
      <p style="color: #374151; font-size: 14px;">Tracking information will be available shortly from your carrier.</p>
    `;

  const addressBlock = data.address
    ? `
      ${DIVIDER}
      <h3 style="margin: 0 0 10px; font-size: 14px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.05em;">Delivering To</h3>
      ${buildAddressHtml(data.address)}
    `
    : '';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <div style="background-color: #059669; padding: 28px 32px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">Your Order Is On Its Way 🚚</h1>
        <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Good news, ${data.name} — your package has been dispatched!</p>
      </div>

      <div style="background-color: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px 20px; margin-bottom: 28px;">
          <p style="margin: 0; font-size: 13px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Order Number</p>
          <p style="margin: 4px 0 0; font-family: monospace; font-size: 20px; font-weight: 700; color: #111827;">${data.orderNumber}</p>
        </div>

        ${trackingBlock}
        ${addressBlock}

        ${DIVIDER}

        <a href="${orderUrl}" style="display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 14px; text-decoration: none;">
          Track My Order
        </a>

        ${FOOTER}
      </div>
    </div>
  `;

  await sendMail({
    to: email,
    subject: `Accessomart — Your Order ${data.orderNumber} Has Shipped`,
    html,
  });
};

/**
 * Ships a support inquiry notification to the admin and a confirmation to the sender
 */
export const sendSupportInquiryEmail = async (data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) => {
  // 1. Notify Admin
  const adminHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <h2 style="color: #6366f1;">New Support Inquiry</h2>
      <p>A new message has been received via the Accessomart Support Nexus.</p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <p style="margin: 0 0 12px 0;"><strong>From:</strong> ${data.name} (&lt;${data.email}&gt;)</p>
        <p style="margin: 0 0 12px 0;"><strong>Subject:</strong> ${data.subject}</p>
        <p style="margin: 0;"><strong>Message:</strong></p>
        <p style="white-space: pre-wrap; margin-top: 8px; color: #374151;">${data.message}</p>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">Reply directly to this email to communicate with the customer.</p>
    </div>
  `;

  await sendMail({
    to: process.env.SUPPORT_EMAIL || 'support@accessomart.com',
    subject: `[SUPPORT INQUIRY] ${data.subject}`,
    replyTo: data.email,
    html: adminHtml,
  });

  // 2. Automated Confirmation to User
  const userHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <h2 style="color: #6366f1;">Transmission Received</h2>
      <p>Hi ${data.name},</p>
      <p>Your support inquiry regarding <strong>"${data.subject}"</strong> has been successfully received by our specialists.</p>
      <p>We are currently analyzing your request and will respond within our target latency of 12-24 hours.</p>
      
      <div style="border-top: 1px solid #e5e7eb; margin-top: 32px; padding-top: 16px; font-size: 14px; color: #6b7280;">
        <p>Best regards,<br>The Accessomart Support Team</p>
      </div>
    </div>
  `;

  await sendMail({
    to: data.email,
    subject: 'Accessomart - Support Inquiry Received',
    html: userHtml,
  });
};

/**
 * Ships an abandoned cart recovery transmission
 */
export const sendAbandonedCartEmail = async (email: string, items: any[], total: string | number) => {
  const cartUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/cart`;
  
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        <img src="${item.variant?.imageUrl || item.variant?.product?.images?.[0]?.url || 'https://via.placeholder.com/50'}" alt="${item.variant?.name || item.variant?.product?.name || 'Product'}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-family: sans-serif;">
        <strong>${item.variant?.product?.name || 'Product'}</strong><br/>
        <span style="font-size: 14px; color: #6b7280;">${item.variant?.name || ''}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-family: sans-serif; text-align: right;">
        x${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-family: sans-serif; text-align: right;">
        $${(Number(item.variant?.price || 0) * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <h2 style="color: #6366f1;">You left something behind...</h2>
      <p>Hi there,</p>
      <p>We noticed you left some great gear in your cart. Your items are waiting, but stock is limited!</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        ${itemsHtml}
      </table>
      
      <div style="text-align: right; margin-bottom: 24px;">
        <strong style="font-size: 18px;">Total: $${Number(total).toFixed(2)}</strong>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${cartUrl}" style="background-color: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Complete Your Purchase</a>
      </div>
      
      <p style="font-size: 14px; color: #6b7280; text-align: center;">
        Need help? Reply directly to this email to reach our support team.
      </p>
    </div>
  `;

  await sendMail({
    to: email,
    subject: "Hurry! Your cart is waiting...",
    html,
  });
};

