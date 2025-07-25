import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './configs/db.js';
import { clerkMiddleware } from '@clerk/express';
import clerkWebhooks from './controllers/ClerkWebHooks.js';
import userRouter from './routes/userRoutes.js';
import hotelRouter from './routes/hotelRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import roomRouter from './routes/roomRoute.js';
import bookingRouter from './routes/bookingRoute.js';

// connect to MongoDB
connectDB();

// connect to Cloudinary
connectCloudinary();

const app = express();
app.use(cors());
app.use(express.json());

// Clerk middleware (must come early)
app.use(clerkMiddleware());

// Clerk webhooks route (must be before auth middleware)
app.post('/api/clerk', clerkWebhooks);

app.get('/', (req, res) => 
  res.send('Backend is running Buddy !')
);

app.use('/api/user', userRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/booking', bookingRouter);

const PORT = process.env.PORT || 4444;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
