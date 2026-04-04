import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';
import { stripe } from '../lib/stripe';
import { paypalClient } from '../lib/paypal';
import paypal from '@paypal/checkout-server-sdk';

export const orderRoutes = Router();

// ─── SCHEMAS ──────────────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  addressId: z.string().optional(),
  addressData: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().optional(),
    postalCode: z.string().min(1),
    country: z.string().optional(),
  }).optional(),
  paymentProvider: z.enum(['STRIPE', 'PAYPAL', 'COD']).default('STRIPE'),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => !!(data.addressId || data.addressData), {
  message: "Either addressId or addressData must be provided",
  path: ["addressId"]
});

const capturePaypalSchema = z.object({
  paypalOrderId: z.string().min(1),
});

const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
});

// ─── WEBHOOKS ─────────────────────────────────────────────────────────────────

// Stripe Webhook: This MUST use raw body for signature verification
orderRoutes.post('/webhook/stripe', async (req: any, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error('[Stripe Webhook] Missing signature or webhook secret.');
    return res.status(400).send('Webhook Error: Missing signature or secret');
  }

  let event;

  try {
    // Verify signature using the raw body captured in index.ts
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any;
    const orderNumber = paymentIntent.metadata.orderNumber;

    if (orderNumber) {
      try {
        await finalizeOrder(orderNumber, paymentIntent);
        console.log(`[Stripe Webhook] Order ${orderNumber} finalized successfully.`);
      } catch (err: any) {
        console.error(`[Stripe Webhook] Failed to finalize order ${orderNumber}: ${err.message}`);
      }
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

/**
 * Shared helper to finalize an order after successful payment.
 */
async function finalizeOrder(orderNumber: string, paymentMetadata: any) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { payment: true },
  });

  if (!order) throw new Error('Order not found.');
  
  // Idempotency check: If already confirmed, skip
  if (order.status === 'CONFIRMED' || order.payment?.status === 'CAPTURED') {
    return;
  }

  await prisma.$transaction(async (tx) => {
    // Update payment record
    await tx.payment.update({
      where: { orderId: order.id },
      data: {
        status: 'CAPTURED',
        paidAt: new Date(),
        metadata: paymentMetadata as any,
      },
    });

    // Update order status
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'CONFIRMED' },
    });

    // Clear cart for the user
    const cart = await tx.cart.findUnique({ where: { userId: order.userId } });
    if (cart) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  });
}

// ─── GET /api/v1/orders ───────────────────────────────────────────────────────
orderRoutes.get('/', authenticate, async (req: AuthRequest, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.userId },
    include: {
      items: {
        include: { variant: { include: { product: true } } },
      },
      address: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ orders });
});

// ─── GET /api/v1/orders/:id ───────────────────────────────────────────────────
orderRoutes.get('/:id', authenticate, async (req: AuthRequest, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, userId: req.userId },
    include: {
      items: true,
      address: true,
      payment: true,
    },
  });
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  return res.json({ order });
});

// ─── POST /api/v1/orders (Checkout) ──────────────────────────────────────────
orderRoutes.post('/', authenticate, validate(checkoutSchema), async (req: AuthRequest, res) => {
  const { addressId, addressData, paymentProvider = 'STRIPE', couponCode, notes } = req.body;

  // Fetch cart
  const cart = await prisma.cart.findUnique({
    where: { userId: req.userId },
    include: {
      items: {
        include: {
          variant: {
            include: { inventory: true, product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  // Calculate totals
  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.variant.price) * item.quantity,
    0
  );
  const shippingCost = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
  const taxAmount = subtotal * 0.08;               // 8% tax
  const total = subtotal + shippingCost + taxAmount;

  // Generate order number
  const count = await prisma.order.count();
  const orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;

  let providerPaymentId: string | undefined;
  let clientSecret: string | undefined;

  // Initialize Stripe Payment Intent if provider is Stripe
  if (paymentProvider === 'STRIPE') {
    const amountInCents = Math.round(Number(total) * 100);
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: { orderNumber, userId: req.userId! },
      });
      providerPaymentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret || undefined;
    } catch (err: any) {
      return res.status(400).json({ error: `Stripe error: ${err.message}` });
    }
  } else if (paymentProvider === 'PAYPAL') {
    try {
      const request = new (paypal.orders as any).OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: total.toFixed(2),
          },
          description: `Order ${orderNumber} for Accessomart`,
        }],
      });

      const response = await paypalClient.execute(request);
      providerPaymentId = response.result.id;
      // For PayPal, we return the order ID as the client "secret" or identifier
      clientSecret = response.result.id; 
    } catch (err: any) {
      return res.status(400).json({ error: `PayPal error: ${err.message}` });
    }
  }

  // Create order in transaction
  try {
    const order = await prisma.$transaction(async (tx) => {
      let finalAddressId = addressId;

      if (!finalAddressId && addressData) {
        const newAddress = await tx.address.create({
          data: {
            userId: req.userId!,
            firstName: addressData.firstName,
            lastName: addressData.lastName,
            line1: addressData.address,
            city: addressData.city,
            state: addressData.state || 'N/A',
            postalCode: addressData.postalCode,
            country: addressData.country || 'US',
          }
        });
        finalAddressId = newAddress.id;
      }

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: req.userId!,
          addressId: finalAddressId,
          subtotal,
          shippingCost,
          taxAmount,
          total,
          couponCode,
          notes,
          items: {
            create: cart.items.map(item => ({
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: Number(item.variant.price),
              totalPrice: Number(item.variant.price) * item.quantity,
              productName: item.variant.product.name,
              variantName: item.variant.name,
              imageUrl: item.variant.product.images[0]?.url,
            })),
          },
        },
        include: { items: true },
      });

      // Create payment stub (PENDING)
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          provider: paymentProvider as any,
          providerPaymentId,
          amount: total,
          status: 'PENDING',
        },
      });

      // We DO NOT clear the cart items yet. Cart items are only cleared upon successful payment.
      return newOrder;
    });

    return res.status(201).json({ order, clientSecret });
  } catch (err: any) {
    console.error('[Orders API] Checkout Transaction Error:', err);
    return res.status(500).json({ error: 'Failed to process checkout. Please try again.', details: err.message });
  }
});

// ─── POST /api/v1/orders/:id/confirm-payment ─────────────────────────────────
orderRoutes.post('/:id/confirm-payment', authenticate, async (req: AuthRequest, res) => {
  const orderId = req.params.id;
  
  const payment = await prisma.payment.findUnique({ 
    where: { orderId },
    include: { order: true }
  });
  
  if (!payment || payment.provider !== 'STRIPE' || !payment.providerPaymentId) {
    return res.status(400).json({ error: 'Invalid or missing Stripe payment record.' });
  }

  try {
    // If order is already confirmed (e.g., via webhook), just return it
    if (payment.status === 'CAPTURED' || payment.order.status === 'CONFIRMED') {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { address: true, payment: true }
        });
        return res.json({ success: true, order });
    }

    // Securely retrieve the payment intent from Stripe
    const pi = await stripe.paymentIntents.retrieve(payment.providerPaymentId);
    
    if (pi.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment has not succeeded yet.', status: pi.status });
    }

    // Finalize order logically and clear cart
    await finalizeOrder(payment.order.orderNumber, pi);
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { address: true, payment: true }
    });

    res.json({ success: true, order });
  } catch (err: any) {
    console.error(`[Orders API] Verification failed for Order ${orderId}:`, err);
    res.status(500).json({ error: `Verification failed: ${err.message}` });
  }
});

// ─── POST /api/v1/orders/:id/capture-paypal ──────────────────────────────────
orderRoutes.post('/:id/capture-paypal', authenticate, validate(capturePaypalSchema), async (req: AuthRequest, res) => {
  const orderId = req.params.id;
  const { paypalOrderId } = req.body;

  try {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { order: true }
    });

    if (!payment || payment.status === 'CAPTURED') {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { address: true, payment: true }
      });
      return res.json({ success: !!order, order });
    }

    // Capture the PayPal order
    const request = new (paypal.orders as any).OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});
    const response = await paypalClient.execute(request);

    if (response.result.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'PayPal payment not completed.', status: response.result.status });
    }

    // Finalize order logically and clear cart
    await finalizeOrder(payment.order.orderNumber, response.result);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { address: true, payment: true }
    });

    res.json({ success: true, order });
  } catch (err: any) {
    console.error(`[Orders API] PayPal capture failed for Order ${orderId}:`, err);
    res.status(500).json({ error: `PayPal capture failed: ${err.message}` });
  }
});

// ─── PATCH /api/v1/orders/:id/status (Admin only) ────────────────────────────
orderRoutes.patch('/:id/status', authenticate, requireAdmin, validate(orderStatusSchema), async (req: AuthRequest, res) => {
  const { status } = req.body;

  try {
    const updateData: any = { status };

    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData,
    });

    return res.json({ order });
  } catch (error: any) {
    console.error('[Orders API] Status Update Error:', error);
    return res.status(500).json({ error: 'Failed to update order status', details: error.message });
  }
});
