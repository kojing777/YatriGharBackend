import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
    try {
        console.log('Webhook received:', req.body.type);
        
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        //getting headers from request
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        };

        //verifying the headers
        await whook.verify(JSON.stringify(req.body), headers);

        //getting data from request body
        const { data, type } = req.body;

        console.log('Processing webhook for user:', data.id);

        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: (data.first_name || '') + " " + (data.last_name || ''),
            image: data.image_url,
            role: 'user',
            recentSearchedCities: []
        };
        
        //swithch case for different types of events
        switch (type) {
            case "user.created":
                console.log('Creating user:', userData._id);
                //create user
                try {
                    await User.create(userData);
                    console.log('User created successfully');
                } catch (createError) {
                    console.error('Error creating user:', createError);
                    // If user already exists, that's OK
                    if (createError.code !== 11000) {
                        throw createError;
                    }
                }
                break;

            case "user.updated":
                console.log('Updating user:', userData._id);
                //update user
                await User.findByIdAndUpdate(data.id, userData);
                break;

            case "user.deleted":
                console.log('Deleting user:', data.id);
                //delete user
                await User.findByIdAndDelete(data.id);
                break;

                
            default:
                console.log("Unknown event type:", type);
                break;
        }
        console.log('Webhook processed successfully');
        res.json({ success: true, message: 'webhook received successfully' });
    } catch (error) {
        console.error('Webhook error:', error.message);
        res.status(400).json({ success: false, message: error.message });
    }
}

export default clerkWebhooks;