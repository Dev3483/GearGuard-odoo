const { check, validationResult } = require('express-validator');
const response = require('../utils/response');

exports.validateRegister = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(response(false, 'Validation Error', errors.array()));
        }
        next();
    }
];

exports.validateLogin = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(response(false, 'Validation Error', errors.array()));
        }
        next();
    }
];
