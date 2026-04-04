import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { upload } from '../lib/cloudinary';

/**
 * Wrapper for Multer upload.array(...) to handle errors and return structured JSON.
 * standard format: { error, message, details }
 */
export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  upload.array('images', 10)(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors (LIMIT_FILE_SIZE, etc.)
      return res.status(400).json({
        error: 'IMAGE_UPLOAD_ERROR',
        message: 'The file upload failed due to server constraints.',
        details: err.message || err.code
      });
    } else if (err) {
      // General upload errors (Cloudinary stream failure, etc.)
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during image processing.',
        details: err.message || 'Unknown error'
      });
    }
    
    // Everything went fine
    next();
  });
};
