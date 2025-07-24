import transporter from "../configs/nodemailer.js";
import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

//function to check availability of rooms
const checkAvailability = async (checkInDate, checkOutDate, room) => {
    try {
        const bookings = await Booking.find({
            room,
            checkInDate: { $lte: checkOutDate },
            checkOutDate: { $gte: checkInDate }
        });
        const isAvailable = bookings.length === 0;
        return isAvailable;

    } catch (error) {
        console.error(error.message);
        return false;
    }
};

//api to check room availability
//post/api/booking/check-availability
export const checkAvailabilityApi = async (req, res) => {

    try {
        const { room, checkInDate, checkOutDate } = req.body;
        const isAvailable = await checkAvailability(checkInDate, checkOutDate, room);
        res.status(200).json({ success: true, isAvailable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//api to create a new booking
//POST /api/booking/book
export const createBooking = async (req, res) => {
    try {
        console.log('Booking request received:', req.body);
        console.log('User from middleware:', req.user);

        const { room, checkInDate, checkOutDate, guests, paymentMethod } = req.body;
        const user = req.user._id;

        //before booking check availability
        const isAvailable = await checkAvailability(checkInDate, checkOutDate, room);

        if (!isAvailable) {
            return res.status(400).json({ success: false, message: "Room is not available" });
        }

        //get totalPrice from room details
        const roomData = await Room.findById(room).populate('hotel');
        
        if (!roomData) {
            return res.status(404).json({ success: false, message: "Room not found" });
        }
        
        if (!roomData.hotel) {
            return res.status(404).json({ success: false, message: "Hotel information not found for this room" });
        }

        let totalPrice = roomData.pricePerNight;

        //calculate total price based on number of nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        const timeDiff = checkOut.getTime() - checkIn.getTime()
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        totalPrice *= nights;

        //create booking
        const booking = await Booking.create({
            user,
            room,
            checkInDate,
            checkOutDate,
            hotel: roomData.hotel._id,
            guests: +guests,
            totalPrice,
            paymentMethod,
        });
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: 'Hotel Booking Details',
            html: `
            <h2>Your Booking Details</h2>
            <p>Dear ${req.user.username},</p>
            <p>Thank you for your booking! Here are your details:</p>
            <ul>
            <li><strong>Booking ID:</strong> ${booking._id}</li>
            <li><strong>Hotel Name:</strong> ${roomData.hotel.name}</li>
            <li><strong>Location: </strong> ${roomData.hotel.address}</li>
            <li><strong>Check-in Date:</strong> ${booking.checkInDate.toDateString()}</li>
            <li><strong>Check-out Date:</strong> ${booking.checkOutDate.toDateString()}</li>
            <li><strong>Guests:</strong> ${booking.guests}</li>
            <li><strong>Total Amount:</strong> ${process.env.CURRENCY || '$'}${booking.totalPrice}</li>
            </ul>
            <p>We hope you enjoy your stay!</p>
        `
        }
        
        // Try to send email, but don't fail booking if email fails
        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue with booking success even if email fails
        }
        
        res.status(201).json({ success: true, message: "Booking created successfully", booking });

    } catch (error) {
        // Enhanced error logging for debugging
        console.error('Booking creation error:', error);
        if (error.response) {
            console.error('Nodemailer response error:', error.response);
        }
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        // Log relevant variables
        console.error('req.user:', req.user);
        console.error('process.env.SENDER_EMAIL:', process.env.SENDER_EMAIL);
        console.error('process.env.BREVO_SMTP_SERVER:', process.env.BREVO_SMTP_SERVER);
        console.error('process.env.BREVO_SMTP_USER:', process.env.BREVO_SMTP_USER);
        console.error('process.env.BREVO_SMTP_PASS:', process.env.BREVO_SMTP_PASS ? '***' : undefined);
        res.status(500).json({ success: false, message: 'Failed to create booking', error: error.message });
    }
};

//api to get all bookings of a user
//GET /api/booking/user
export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;
        const bookings = await Booking.find({ user }).populate('room hotel').sort({ createdAt: -1 });

        res.status(200).json({ success: true, bookings });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
};

//api to get all bookings of a hotel
//GET /api/booking/hotel    
export const getHotelBookings = async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ owner: req.auth.userId });
        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found' });
        }
        const bookings = await Booking.find({ hotel: hotel._id }).populate('room hotel user').sort({ createdAt: -1 });

        //total bookings
        const totalBookings = bookings.length;

        //total revenue
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

        res.status(200).json({ success: true, dashboardData: { bookings, totalBookings, totalRevenue } });

    } catch (error) {

        console.error(error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch hotel bookings' });
    }
};
