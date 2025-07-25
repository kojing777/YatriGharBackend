import Hotel from "../models/Hotel.js";
import User from "../models/User.js";


export const registerHotel = async (req, res) => {
    try {
        const { name, address, contact, city, } = req.body;
        const owner = req.user._id; // Assuming user is authenticated and user ID is available in req.user


        //check if user is already registered
        const hotel = await Hotel.findOne({ owner });
        if (hotel) {
            return res.status(400).json({ success: false, message: "Hotel already registered by this user" });
        }


        await Hotel.create({
            name,
            address,
            contact,
            owner,
            city,
        });

        await User.findByIdAndUpdate(owner, { role: "hotelOwner" });


        res.status(201).json({ success: true, message: "Hotel registered successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};