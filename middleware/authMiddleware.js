import User from "../models/User.js";

//middkware to check if user is authenticated
export const protect = async (req, res, next) => {
    try {
        const { userId } = req.auth;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized - No user ID' });
        }
        
        console.log('Auth middleware - userId:', userId);
        
        const user = await User.findById(userId);
        
        if (!user) {
            console.log('User not found in database. User ID:', userId);
            return res.status(404).json({ 
                success: false, 
                message: 'User not found. Please try logging out and logging in again.' 
            });
        }
        
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ success: false, message: 'Server error in authentication' });
    }
}