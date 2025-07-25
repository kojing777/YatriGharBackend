import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    hotel: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Hotel" },
    roomType: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    amenities: [{ type: String, required: true }],
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },


}, { timestamps: true });

const Room = mongoose.model("Room", roomSchema);

export default Room;
