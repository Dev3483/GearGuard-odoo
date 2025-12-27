const User = require('../models/User');
const response = require('../utils/response');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Manager/Admin)
exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.json(response(true, 'Users list', users));
    } catch (err) {
        next(err);
    }
};

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Private (Admin)
exports.updateRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });

        if (!user) {
            return res.status(404).json(response(false, 'User not found'));
        }

        res.json(response(true, 'User role updated', user));
    } catch (err) {
        next(err);
    }
};
