import User from "../models/User.js";

//middkware to check if user is authenticated
export const protect = async (req, res, next) => {
    try {
        const { userId } = req.auth;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized - No user ID' });
        }
        
        console.log('Auth middleware - userId:', userId);
        
        let user = await User.findById(userId);
        
        if (!user) {
            console.log('User not found in database. Creating user with ID:', userId);
            
            // Create user with basic data if not found
            // This handles cases where webhook failed or user was created before webhook was set up
            try {
                const userData = {
                    _id: userId,
                    username: 'User',
                    email: 'temp@example.com',
                    image: 'https://via.placeholder.com/150',
                    role: 'user',
                    recentSearchedCities: []
                };
                
                user = await User.create(userData);
                console.log('User created successfully with ID:', userId);
            } catch (createError) {
                console.error('Error creating user in auth middleware:', createError);
                return res.status(500).json({ 
                    success: false, 
                    message: 'Unable to create user. Please try again.' 
                });
            }
        }
        
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ success: false, message: 'Server error in authentication' });
    }
}