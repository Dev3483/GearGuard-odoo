const response = require('../utils/response');

module.exports = (...roles) => {
    return (req, res, next) => {
        console.log(`Checking role access for: ${req.user ? req.user.role : 'unknown'} on ${req.method} ${req.originalUrl}`);
        console.log(`Authorized roles: ${roles.join(', ')}`);
        
        if (!req.user || !roles.includes(req.user.role)) {
            console.log(`ACCESS DENIED for user role: ${req.user ? req.user.role : 'unknown'}`);
            return res.status(403).json(response(false, `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route`));
        }
        console.log(`ACCESS GRANTED`);
        next();
    };
};
