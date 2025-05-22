import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import DroneFlight from '../models/DroneFlight.js';

const router = express.Router();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Start a new drone flight
router.post('/start', async (req, res) => {
    try {
        const { droneId } = req.body;

        if (!droneId) {
            return res.status(400).json({ error: 'Missing droneId' });
        }

        const flight = new DroneFlight({
            droneId,
            status: 'in-progress'
        });

        await flight.save();
        res.status(201).json(flight);
    } catch (error) {
        console.error('Error starting flight:', error);
        res.status(500).json({ error: 'Failed to start flight' });
    }
});

// End a drone flight
router.post('/end/:flightId', async (req, res) => {
    try {
        const { flightId } = req.params;
        const flight = await DroneFlight.findById(flightId);

        if (!flight) {
            return res.status(404).json({ error: 'Flight not found' });
        }

        flight.status = 'completed';
        flight.endTime = new Date();
        flight.duration = Math.floor((flight.endTime - flight.startTime) / 1000); // Duration in seconds

        await flight.save();
        res.json(flight);
    } catch (error) {
        console.error('Error ending flight:', error);
        res.status(500).json({ error: 'Failed to end flight' });
    }
});

// Upload an image during flight
router.post('/upload-image/:flightId', async (req, res) => {
    try {
        const { flightId } = req.params;
        const { image, metadata } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const flight = await DroneFlight.findById(flightId);
        if (!flight) {
            return res.status(404).json({ error: 'Flight not found' });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(image, {
            folder: `drone-flights/${flightId}`,
            resource_type: 'auto'
        });

        // Add image to flight record
        flight.images.push({
            url: result.secure_url,
            publicId: result.public_id,
            metadata: metadata || {}
        });

        await flight.save();
        res.json(flight);
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Get all images for a flight
router.get('/images/:flightId', async (req, res) => {
    try {
        const { flightId } = req.params;
        const flight = await DroneFlight.findById(flightId);

        if (!flight) {
            return res.status(404).json({ error: 'Flight not found' });
        }

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
            .select('-images'); // Exclude images from the list view
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

        if (!flight) {
            return res.status(404).json({ error: 'Flight not found' });
        }

        res.json(flight);
    } catch (error) {
        console.error('Error fetching flight:', error);
        res.status(500).json({ error: 'Failed to fetch flight' });
    }
});

export default router;
