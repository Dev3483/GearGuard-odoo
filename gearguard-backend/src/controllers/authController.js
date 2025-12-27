const User = require('../models/User');
const jwt = require('jsonwebtoken');
const response = require('../utils/response');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ user: { id } }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json(response(false, 'User already exists'));
        }

        user = new User({
            name,
            email,
            password,
            role: role || 'requester' // Default to requester if not specified (or should we restrict role selection?)
        });

        await user.save();

        const token = generateToken(user.id);

        res.status(201).json(response(true, 'User registered', { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }));
    } catch (err) {
        next(err);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json(response(false, 'Invalid credentials'));
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json(response(false, 'Invalid credentials'));
        }

        const token = generateToken(user.id);

        res.json(response(true, 'User logged in', { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }));
    } catch (err) {
        next(err);
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(response(true, 'Current user data', user));
    } catch (err) {
        next(err);
    }
};
