import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    room: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Room" },
    hotel: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Hotel" },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    guests: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'Pay at hotel'
    },
    isPaid: { type: Boolean, default: false }
}, { timestamps: true });


const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
