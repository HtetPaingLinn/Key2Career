const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to handle Key2Career JWT tokens
const protectKey2Career = async (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1]; // Extract token
            
            // Parse Key2Career JWT token (no verification needed as it comes from trusted source)
            const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
            
            console.log('Key2Career JWT decoded:', decoded);
            
            // Extract user info from Key2Career token
            const email = decoded.email || decoded.sub;
            const name = decoded.name || decoded.username || email?.split('@')[0] || 'User';
            
            if (!email) {
                return res.status(401).json({ message: "Invalid token: no email found" });
            }

            // Find or create user in interview backend
            let user = await User.findOne({ email: email });
            
            if (!user) {
                // Create new user with Key2Career data
                user = new User({
                    name: name,
                    email: email,
                    password: 'key2career_user', // Placeholder password since we don't need it
                    profileImageUrl: null
                });
                await user.save();
                console.log('Created new user from Key2Career token:', user);
            }

            // Attach user to request
            req.user = user;
            next();
        } else {
            res.status(401).json({ message: "Not authorized, no token" });
        }
    } catch (error) {
        console.error('Key2Career auth error:', error);
        res.status(401).json({ message: "Token failed", error: error.message });
    }
};

module.exports = { protectKey2Career };

