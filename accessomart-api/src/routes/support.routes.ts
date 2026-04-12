import { Router } from 'express';
import { sendSupportInquiryEmail } from '../lib/email';
import { z } from 'zod';

const router = Router();

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = contactSchema.parse(req.body);
    
    await sendSupportInquiryEmail({ name, email, subject, message });
    
    res.json({ 
      success: true, 
      message: 'Transmission received. Our specialists have been notified.' 
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: err.flatten().fieldErrors 
      });
    }
    
    console.error('[Support Route] Error processing inquiry:', err);
    res.status(500).json({ error: 'Failed to process transmission. Please try again later.' });
  }
});

export { router as supportRoutes };
