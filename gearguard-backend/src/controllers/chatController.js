const Message = require('../models/Message');

// @desc    Get messages for a specific request
// @route   GET /api/chat/:requestId
// @access  Private
exports.getMessages = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const messages = await Message.find({ request: requestId })
            .populate('sender', 'name role')
            .sort({ createdAt: -1 }) // Newest first for pagination logic, frontend might reverse it
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // Check if user is allowed to see these messages? 
        // Assuming implementation of room security in socket handles realtime, 
        // but for API we should ideally check if user is part of the request context.
        // For now, relying on general auth. Can add logic to check if req.user is related to request.

        res.json({
            success: true,
            data: messages.reverse() // Send back in chronological order
        });
    } catch (err) {
        next(err);
    }
};
