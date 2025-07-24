import User from "../models/User.js";
import { clerkClient } from '@clerk/express';

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
            
            // Get real user data from Clerk and create user in database
            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                console.log('Clerk user data:', clerkUser);
                
                const userData = {
                    _id: userId,
                    username: clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || `User_${userId.slice(-8)}`,
                    email: clerkUser.emailAddresses[0]?.emailAddress || `temp_${userId.slice(-8)}@example.com`,
                    image: clerkUser.imageUrl || clerkUser.profileImageUrl || 'https://via.placeholder.com/150',
                    role: 'user',
                    recentSearchedCities: []
                };
                
                user = await User.create(userData);
                console.log('User created successfully with real Clerk data:', userData);
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