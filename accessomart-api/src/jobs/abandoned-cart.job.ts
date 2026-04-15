import { prisma } from '../lib/prisma';
import { sendAbandonedCartEmail } from '../lib/email';

const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes
const ABANDONED_THRESHOLD = 2 * 60 * 60 * 1000; // 2 hours

let isRunning = false;

export const processAbandonedCarts = async () => {
  if (isRunning) return;
  isRunning = true;

  try {
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

    for (const cart of abandonedCarts) {
      if (!cart.user || !cart.user.email) continue;

      const total = cart.items.reduce(
        (sum, item) => sum + Number(item.variant.price) * item.quantity,
        0
      );

      try {
        await sendAbandonedCartEmail(cart.user.email, cart.items, total);
        
        // Mark as sent
        await prisma.cart.update({
          where: { id: cart.id },
          data: { abandonedEmailSent: true },
        });

      } catch (err) {
        console.error(`[Job: AbandonedCart] Failed to process cart ${cart.id}:`, err);
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
