import express from "express";
import cors from "cors";
import "dotenv/config";
import job from "./lib/cron.js";

import authRoutes from "./routes/authRoutes.js";
import imageRoutes from './routes/imageRoutes.js';

import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 3002;

job.start();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/auth",imageRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
