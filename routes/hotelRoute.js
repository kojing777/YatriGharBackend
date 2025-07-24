import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { registerHotel } from '../controllers/HotelController.js';


const hotelRouter = express.Router();

// Route to register a new hotel
hotelRouter.post('/', protect, registerHotel);

export default hotelRouter;