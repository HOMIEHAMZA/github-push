import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on product ID if available, or use generic products folder
    const productId = req.params.id || 'new-product';
    
    console.log(`[Cloudinary] Initiating upload for product: ${productId}, file: ${file.originalname}`);

    return {
      folder: `accessomart/products/${productId}`,
      format: 'webp', // Auto-optimization to WebP
      public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "")}`,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Global limit
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    };
  },
});

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per image
    files: 10 // Max 10 images as requested
  }
});

export { cloudinary };
