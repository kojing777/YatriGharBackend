import Hotel from "../models/Hotel.js";
import { v2 as cloudinary } from "cloudinary";
import Room from "../models/Room.js";

//api to create a new room for a hotel
export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities } = req.body;

    const hotel = await Hotel.findOne({ owner: req.auth.userId });
    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }

    // Ensure req.files is processed correctly
    const allFiles = Object.values(req.files).flat(); // flatten all image fields into array

    // Upload images to Cloudinary
    const imagePromises = allFiles.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString("base64");
      let dataURI = "data:" + file.mimetype + ";base64," + b64;
      const res = await cloudinary.uploader.upload(dataURI);
      return res.url;
    });

    const images = await Promise.all(imagePromises);

    await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight: +pricePerNight,
      amenities: JSON.parse(amenities),
      images,
    });

    res.json({ success: true, message: "Room created successfully" });
  } catch (error) {
    console.error("Create Room Error:", error); // 🔍 important for debugging
    res.status(500).json({ success: false, message: error.message });
  }
};

//api to get all rooms for a hotel
export const getRooms = async (req, res) => {
    try {
        // Remove the isAvailable filter to show all rooms
        const rooms = await Room.find({}).populate({
            path: 'hotel',
            populate: {
                path: 'owner',
                select: 'image'
            }
        }).sort({ createdAt: -1 });
        
        console.log(`Found ${rooms.length} rooms total`);
        console.log('Sample room hotel data:', rooms[0]?.hotel);
        
        res.status(200).json({ success: true, rooms });

    } catch (error) {
        console.error("getRooms error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

//api to get all rooms for a specific hotel
export const getOwnerRoom = async (req, res) => {
    try {
        console.log("User ID:", req.auth.userId);
        const hotelData = await Hotel.findOne({ owner: req.auth.userId });
        if (!hotelData) {
            return res.status(404).json({ message: "Hotel not found" });
        }
        console.log("Hotel Data:", hotelData);
        const rooms = await Room.find({ hotel: hotelData._id.toString() }).populate('hotel');
        console.log("Rooms:", rooms);
        res.json({ success: true, rooms });
    } catch (error) {
        console.error("getOwnerRoom error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

//api to toggle room availability of a specific room
export const toggleRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.body;

        // Find the room by ID
        const roomData = await Room.findById(roomId);
        if (!roomData) {
          return res.status(404).json({ success: false, message: "Room not found" });
        }
        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();

        res.status(200).json({ success: true, message: "Room availability updated" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}