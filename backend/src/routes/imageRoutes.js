import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


router.get('/test', async (req, res) => {
    console.log('Testing Cloudinary configuration...');
    console.log('Environment variables loaded:', {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'Not Set',
        api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'Not Set'
    });

    try {
        
        const result = await cloudinary.api.ping();
        console.log('Cloudinary ping result:', result);

        res.json({
            success: true,
            message: 'Cloudinary configuration is working',
            config: {
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'Not configured',
                api_key: process.env.CLOUDINARY_API_KEY ? 'Configured' : 'Not configured',
                api_secret: process.env.CLOUDINARY_API_SECRET ? 'Configured' : 'Not configured'
            },
            ping: result
        });
    } catch (error) {
        console.error('Cloudinary test failed:', error);
        res.status(500).json({
            success: false,
            message: 'Cloudinary configuration test failed',
            error: error.message,
            config: {
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'Not configured',
                api_key: process.env.CLOUDINARY_API_KEY ? 'Configured' : 'Not configured',
                api_secret: process.env.CLOUDINARY_API_SECRET ? 'Configured' : 'Not configured'
            }
        });
    }
});

router.get('/images', async (req, res) => {
    try 
    {
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            console.error('Cloudinary configuration is missing');
            throw new Error('Cloudinary configuration is missing');
        }
        console.log('Cloudinary config verified, searching for images...');
        const result = await cloudinary.search
            .expression('resource_type:image') 
            .sort_by('created_at', 'desc')
            .max_results(30)
            .execute();

        console.log(`Found ${result.resources.length} images`);
        res.json({
            success: true,
            data: result.resources
        });
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching images from Cloudinary',
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

export default router; 