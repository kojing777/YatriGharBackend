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
            console.log('User not found in database, creating from Clerk data...');
            
            // If user doesn't exist, try to get user data from Clerk and create user
            // This handles the case where webhook hasn't processed yet
            const clerkUser = req.auth.user;
            
            if (clerkUser) {
                const userData = {
                    _id: userId,
                    email: clerkUser.emailAddresses?.[0]?.emailAddress || clerkUser.email || '',
                    username: clerkUser.firstName + " " + (clerkUser.lastName || ''),
                    image: clerkUser.imageUrl || clerkUser.profileImageUrl || '',
                    role: 'user',
                    recentSearchedCities: []
                };
                
                user = await User.create(userData);
                console.log('User created successfully:', user._id);
            } else {
                return res.status(404).json({ success: false, message: 'User not found and cannot create' });
            }
        }
        
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ success: false, message: 'Server error in authentication' });
    }
}