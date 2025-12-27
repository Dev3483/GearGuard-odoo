const Team = require('../models/Team');
const response = require('../utils/response');

// @desc    Create a team
// @route   POST /api/teams
// @access  Private (Manager)
exports.createTeam = async (req, res, next) => {
    try {
        const team = await Team.create(req.body);
        res.status(201).json(response(true, 'Team created', team));
    } catch (err) {
        next(err);
    }
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
exports.getTeams = async (req, res, next) => {
    try {
        const teams = await Team.find().populate('members', 'name email role');
        res.json(response(true, 'Teams list', teams));
    } catch (err) {
        next(err);
    }
};

// @desc    Update team
// @route   PATCH /api/teams/:id
// @access  Private (Manager)
exports.updateTeam = async (req, res, next) => {
    try {
        const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!team) {
            return res.status(404).json(response(false, 'Team not found'));
        }
        res.json(response(true, 'Team updated', team));
    } catch (err) {
        next(err);
    }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin)
exports.deleteTeam = async (req, res, next) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) {
            return res.status(404).json(response(false, 'Team not found'));
        }
        res.json(response(true, 'Team deleted'));
    } catch (err) {
        next(err);
    }
};
