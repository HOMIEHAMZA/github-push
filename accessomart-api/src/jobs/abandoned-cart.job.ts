import { prisma } from '../lib/prisma';
import { sendAbandonedCartEmail } from '../lib/email';

const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes
const ABANDONED_THRESHOLD = 2 * 60 * 60 * 1000; // 2 hours

let isRunning = false;

export const processAbandonedCarts = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
    console.log(`[Job: AbandonedCart] Run Tick: ${new Date().toISOString()}`);
    console.log('[Job: AbandonedCart] Starting abandoned cart check...');
    const cutoff = new Date(Date.now() - ABANDONED_THRESHOLD);

    const abandonedCarts = await prisma.cart.findMany({
      where: {
        userId: { not: null },
        abandonedEmailSent: false,
        updatedAt: { lt: cutoff },
        items: { some: {} }, // Must have items
      },
      include: {
        user: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { where: { isPrimary: true }, take: 1 }
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log(`[Job: AbandonedCart] Found ${abandonedCarts.length} abandoned carts to process.`);

    for (const cart of abandonedCarts) {
      if (!cart.user) {
        console.log(`[Job: AbandonedCart] Skipped cart ${cart.id}: No associated user.`);
        continue;
      }
      if (!cart.user.email) {
        console.log(`[Job: AbandonedCart] Skipped cart ${cart.id}: User ${cart.user.id} has no email.`);
        continue;
      }

      // Safeguard: Ensure variants still exist
      const validItems = cart.items.filter(item => item.variant);
      if (validItems.length === 0) {
        console.log(`[Job: AbandonedCart] Skipped cart ${cart.id}: All variants deleted.`);
        continue;
      }

      const total = validItems.reduce(
        (sum, item) => sum + (Number(item.variant?.price || 0) * item.quantity),
        0
      );

      try {
        await sendAbandonedCartEmail(cart.user.email, validItems, total);
        console.log(`[Job: AbandonedCart] Email successfully sent to ${cart.user.email} for cart ${cart.id}.`);
        
        // Mark as sent ONLY after success
        // NOTE: This updates the updatedAt timestamp and ONLY marks the email sent flag. 
        // It NEVER deletes cart items. The database retains the cart exactly as-is.
        await prisma.cart.update({
          where: { id: cart.id },
          data: { abandonedEmailSent: true },
        });

      } catch (err) {
        console.error(`[Job: AbandonedCart] Failed to send email for cart ${cart.id}:`, err);
      }
    }
  } catch (globalErr) {
    console.error('[Job: AbandonedCart] Global job error:', globalErr);
  } finally {
    isRunning = false;
  }
};

let jobInterval: NodeJS.Timeout | null = null;

export const startAbandonedCartCron = () => {
  if (jobInterval) return; // Prevent double starting
  
  // Set interval
  jobInterval = setInterval(processAbandonedCarts, CHECK_INTERVAL);
  console.log(`[Job: AbandonedCart] Started. Checking every ${CHECK_INTERVAL / 60000} minutes.`);
};
