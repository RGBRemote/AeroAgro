import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import DroneFlight from '../models/DroneFlight.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post('/start', async (req, res) => {
    try {

      
        const flight = new DroneFlight({
            status: 'in-progress',
            startTime: new Date()
        });

        await flight.save();
        res.status(201).json(flight);
    } catch (error) {
        console.error('Error starting flight:', error);
        res.status(500).json({ error: 'Failed to start flight' });
    }
});

router.post('/end/:flightId', async (req, res) => {
    try {
        const { flightId } = req.params;
        const flight = await DroneFlight.findById(flightId);
        if (!flight) return res.status(404).json({ error: 'Flight not found' });

        flight.status = 'completed';
        flight.endTime = new Date();
        flight.duration = Math.floor((flight.endTime - flight.startTime) / 1000); // in seconds

        await flight.save();
        res.json(flight);
    } catch (error) {
        console.error('Error ending flight:', error);
        res.status(500).json({ error: 'Failed to end flight' });
    }
});

router.post('/upload-image/:flightId', upload.single('file'), async (req, res) => {
    try {
        const { flightId } = req.params;
        const metadata = JSON.parse(req.body.metadata || '{}');

        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const flight = await DroneFlight.findById(flightId);
        if (!flight) return res.status(404).json({ error: 'Flight not found' });

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `drone-flights/${flightId}`,
                    resource_type: 'auto' // auto-detect image, video, etc.
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });


        flight.images.push({
            url: result.secure_url,
            publicId: result.public_id,
            metadata
        });

        await flight.save();
        res.json(flight);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Get all images/files for a flight
router.get('/images/:flightId', async (req, res) => {
    try {
        const { flightId } = req.params;
        const flight = await DroneFlight.findById(flightId);
        if (!flight) return res.status(404).json({ error: 'Flight not found' });

        res.json(flight.images);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

// Get all flights
router.get('/flights', async (req, res) => {
    try {
        const flights = await DroneFlight.find()
            .sort({ startTime: -1 })
            .select('-images');
        res.json(flights);
    } catch (error) {
        console.error('Error fetching flights:', error);
        res.status(500).json({ error: 'Failed to fetch flights' });
    }
});

// Get a specific flight
router.get('/flights/:flightId', async (req, res) => {
    try {
        const { flightId } = req.params;
        const flight = await DroneFlight.findById(flightId);
        if (!flight) return res.status(404).json({ error: 'Flight not found' });

        res.json(flight);
    } catch (error) {
        console.error('Error fetching flight:', error);
        res.status(500).json({ error: 'Failed to fetch flight' });
    }
});

// Update flight path
// router.post('/update-path/:flightId', async (req, res) => {
//     try {
//         const { flightId } = req.params;


//         if (!latitude || !longitude || !altitude) {
//             return res.status(400).json({ error: 'Missing required fields' });
//         }

//         const flight = await DroneFlight.findById(flightId);
//         if (!flight) return res.status(404).json({ error: 'Flight not found' });

//         flight.flightPath.push({
//             timestamp: new Date()
//         });

//         await flight.save();
//         res.json(flight);
//     } catch (error) {
//         console.error('Error updating flight path:', error);
//         res.status(500).json({ error: 'Failed to update flight path' });
//     }
// });

export default router;
