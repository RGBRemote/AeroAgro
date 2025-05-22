import mongoose from 'mongoose';

const droneFlightSchema = new mongoose.Schema({
    droneId: {
        type: String,
        required: true,
        index: true
    },
    startTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed', 'cancelled'],
        default: 'in-progress'
    },
    duration: {
        type: Number // Duration in seconds
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        metadata: {
            altitude: Number,
            heading: Number,
            speed: Number,
            temperature: Number,
            humidity: Number,
            batteryLevel: Number
        }
    }],
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
droneFlightSchema.index({ startTime: -1 });
droneFlightSchema.index({ status: 1 });
droneFlightSchema.index({ 'images.timestamp': -1 });

const DroneFlight = mongoose.model('DroneFlight', droneFlightSchema);

export default DroneFlight; 
