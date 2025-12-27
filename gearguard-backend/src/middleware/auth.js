const jwt = require('jsonwebtoken');
const response = require('../utils/response');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        return res.status(401).json(response(false, 'No token, authorization denied'));
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        
        // Optional: Check if user still exists
        const user = await User.findById(req.user.id);
        if(!user) {
             return res.status(401).json(response(false, 'Token is not valid (user not found)'));
        }
        
        // Attach full user object if needed, or just ID/Role from token
        // Let's attach role from DB to be sure, or trust token. 
        // Trusting token for speed, but DB for security (revocation).
        // Let's attach role from user object found in DB.
        req.user.role = user.role;

        next();
    } catch (err) {
        res.status(401).json(response(false, 'Token is not valid'));
    }
};
