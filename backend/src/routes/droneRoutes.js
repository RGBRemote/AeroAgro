// import express from 'express';
// import { v2 as cloudinary } from 'cloudinary';
// import multer from 'multer';
// import DroneFlight from '../models/DroneFlight.js';
// import { protect } from '../middleware/auth.js';

// const router = express.Router();

// // Configure multer for memory storage
// const upload = multer({
//     storage: multer.memoryStorage(),
//     limits: {
//         fileSize: 5 * 1024 * 1024, // 5MB limit
//     },
//     fileFilter: (req, file, cb) => {
//         // Accept images only
//         if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
//             return cb(new Error('Only image files are allowed!'), false);
//         }
//         cb(null, true);
//     }
// });

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });


// router.post('/start', protect, async (req, res) => {
//     try {
//         const { droneId } = req.user; 

//         const flight = new DroneFlight({
//             droneId,
//             status: 'in-progress'
//         });

//         await flight.save();
//         res.status(201).json(flight);
//     } catch (error) {
//         console.error('Error starting flight:', error);
//         res.status(500).json({ error: 'Failed to start flight' });
//     }
// });

// // End a drone flight
// router.post('/end/:flightId', protect, async (req, res) => {
//     try {
//         const { flightId } = req.params;
//         const { droneId } = req.user;

//         const flight = await DroneFlight.findOne({ _id: flightId, droneId });
//         if (!flight) {
//             return res.status(404).json({ error: 'Flight not found' });
//         }

//         flight.status = 'completed';
//         flight.endTime = new Date();
//         flight.duration = Math.floor((flight.endTime - flight.startTime) / 1000);

//         await flight.save();
//         res.json(flight);
//     } catch (error) {
//         console.error('Error ending flight:', error);
//         res.status(500).json({ error: 'Failed to end flight' });
//     }
// });

// router.post('/upload-image/:flightId', protect, upload.fields([
//     { name: 'image', maxCount: 1 },
//     { name: 'heatMap', maxCount: 1 }
// ]), async (req, res) => {
//     try {
//         const { flightId } = req.params;
//         const { droneId } = req.user;
//         const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};

//         if (!req.files || !req.files.image || !req.files.heatMap) {
//             return res.status(400).json({ error: 'Both image and heat map are required' });
//         }

//         const flight = await DroneFlight.findOne({ _id: flightId, droneId });
//         if (!flight) {
//             return res.status(404).json({ error: 'Flight not found' });
//         }

//         // Convert buffer to base64 for Cloudinary
//         const imageBuffer = req.files.image[0].buffer.toString('base64');
//         const heatMapBuffer = req.files.heatMap[0].buffer.toString('base64');

//         // Upload original image
//         const imageResult = await cloudinary.uploader.upload(
//             `data:${req.files.image[0].mimetype};base64,${imageBuffer}`,
//             {
//                 folder: `drone-flights/${flightId}/images`,
//                 resource_type: 'auto'
//             }
//         );

//         // Upload heat map
//         const heatMapResult = await cloudinary.uploader.upload(
//             `data:${req.files.heatMap[0].mimetype};base64,${heatMapBuffer}`,
//             {
//                 folder: `drone-flights/${flightId}/heatmaps`,
//                 resource_type: 'auto'
//             }
//         );

//         flight.images.push({
//             url: imageResult.secure_url,
//             publicId: imageResult.public_id,
//             heatMapUrl: heatMapResult.secure_url,
//             heatMapPublicId: heatMapResult.public_id,
//             metadata: metadata
//         });

//         await flight.save();
//         res.json(flight);
//     } catch (error) {
//         console.error('Error uploading image:', error);
//         res.status(500).json({ error: 'Failed to upload image' });
//     }
// });

// // Get all images for a flight
// router.get('/images/:flightId', protect, async (req, res) => {
//     try {
//         const { flightId } = req.params;
//         const { droneId } = req.user;

//         const flight = await DroneFlight.findOne({ _id: flightId, droneId });
//         if (!flight) {
//             return res.status(404).json({ error: 'Flight not found' });
//         }

//         res.json(flight.images);
//     } catch (error) {
//         console.error('Error fetching images:', error);
//         res.status(500).json({ error: 'Failed to fetch images' });
//     }
// });

// // Get all flights for the authenticated drone
// router.get('/flights', protect, async (req, res) => {
//     try {
//         const { droneId } = req.user;
//         const flights = await DroneFlight.find({ droneId })
//             .sort({ startTime: -1 })
//             .select('-images');
//         res.json(flights);
//     } catch (error) {
//         console.error('Error fetching flights:', error);
//         res.status(500).json({ error: 'Failed to fetch flights' });
//     }
// });

// // Get a specific flight
// router.get('/flights/:flightId', protect, async (req, res) => {
//     try {
//         const { flightId } = req.params;
//         const { droneId } = req.user;

//         const flight = await DroneFlight.findOne({ _id: flightId, droneId });
//         if (!flight) {
//             return res.status(404).json({ error: 'Flight not found' });
//         }

//         res.json(flight);
//     } catch (error) {
//         console.error('Error fetching flight:', error);
//         res.status(500).json({ error: 'Failed to fetch flight' });
//     }
// });

// export default router;



import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import DroneFlight from '../models/DroneFlight.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


router.post('/start', protect, async (req, res) => {
    try {
        const { droneId } = req.user; 

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
router.post('/end/:flightId', protect, async (req, res) => {
    try {
        const { flightId } = req.params;
        const { droneId } = req.user;

        const flight = await DroneFlight.findOne({ _id: flightId, droneId });
        if (!flight) {
            return res.status(404).json({ error: 'Flight not found' });
        }

        flight.status = 'completed';
        flight.endTime = new Date();
        flight.duration = Math.floor((flight.endTime - flight.startTime) / 1000);

        await flight.save();
        res.json(flight);
    } catch (error) {
        console.error('Error ending flight:', error);
        res.status(500).json({ error: 'Failed to end flight' });
    }
});

router.post('/upload-image/:flightId', protect, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'heatMap', maxCount: 1 }
]), async (req, res) => {
    try {
        const { flightId } = req.params;
        const { droneId } = req.user;
        const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : {};

        if (!req.files || !req.files.image || !req.files.heatMap) {
            return res.status(400).json({ error: 'Both image and heat map are required' });
        }

        const flight = await DroneFlight.findOne({ _id: flightId, droneId });
        if (!flight) {
            return res.status(404).json({ error: 'Flight not found' });
        }

        // Convert buffer to base64 for Cloudinary
        const imageBuffer = req.files.image[0].buffer.toString('base64');
        const heatMapBuffer = req.files.heatMap[0].buffer.toString('base64');

        // Upload original image
        const imageResult = await cloudinary.uploader.upload(
            `data:${req.files.image[0].mimetype};base64,${imageBuffer}`,
            {
                folder: `drone-flights/${flightId}/images`,
                resource_type: 'auto'
            }
        );

        // Upload heat map
        const heatMapResult = await cloudinary.uploader.upload(
            `data:${req.files.heatMap[0].mimetype};base64,${heatMapBuffer}`,
            {
                folder: `drone-flights/${flightId}/heatmaps`,
                resource_type: 'auto'
            }
        );

        flight.images.push({
            url: imageResult.secure_url,
            publicId: imageResult.public_id,
            heatMapUrl: heatMapResult.secure_url,
            heatMapPublicId: heatMapResult.public_id,
            metadata: metadata
        });

        await flight.save();
        res.json(flight);
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Get all images for a drone
router.get('/images', protect, async (req, res) => {
    try {
        const { droneId } = req.user;

        // Find all flights for this drone
        const flights = await DroneFlight.find({ droneId })
            .select('images')
            .sort({ startTime: -1 });

        // Combine all images from all flights
        const allImages = flights.reduce((acc, flight) => {
            return [...acc, ...flight.images];
        }, []);

        res.json(allImages);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});

// Get all flights for the authenticated drone
router.get('/flights', protect, async (req, res) => {
    try {
        const { droneId } = req.user;
        const flights = await DroneFlight.find({ droneId });
            
        res.json(flights);
    } catch (error) {
        console.error('Error fetching flights:', error);
        res.status(500).json({ error: 'Failed to fetch flights' });
    }
});

// Get a specific flight
router.get('/flights/:flightId', protect, async (req, res) => {
    try {
        const { flightId } = req.params;
        const { droneId } = req.user;

        const flight = await DroneFlight.findOne({ _id: flightId, droneId });
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
