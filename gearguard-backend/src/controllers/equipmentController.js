const Equipment = require('../models/Equipment');
const Request = require('../models/Request');
const response = require('../utils/response');

// @desc    Create equipment
// @route   POST /api/equipment
// @access  Private (Manager)
exports.createEquipment = async (req, res, next) => {
    try {
        const equipment = await Equipment.create(req.body);
        res.status(201).json(response(true, 'Equipment created', equipment));
    } catch (err) {
        next(err);
    }
};

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Private
exports.getEquipment = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = {};
        if (status) query.status = status;
        // Default to not showing archived/scrapped? Prompt says list all. Let's just filter if asked.

        const equipment = await Equipment.find(query)
            .populate('assignedTo', 'name')
            .populate('assignedTeam', 'name')
            .populate('defaultTechnician', 'name')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Equipment.countDocuments(query);

        res.json(response(true, 'Equipment list', {
            equipment,
            totalPages: Math.ceil(count / limit),
            currentPage: page
        }));
    } catch (err) {
        next(err);
    }
};

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Private
exports.getEquipmentById = async (req, res, next) => {
    try {
        const equipment = await Equipment.findById(req.params.id)
            .populate('assignedTo', 'name')
            .populate('assignedTeam', 'name')
            .populate('defaultTechnician', 'name');

        if (!equipment) {
            return res.status(404).json(response(false, 'Equipment not found'));
        }

        res.json(response(true, 'Equipment details', equipment));
    } catch (err) {
        next(err);
    }
};

// @desc    Update equipment
// @route   PATCH /api/equipment/:id
// @access  Private (Manager)
exports.updateEquipment = async (req, res, next) => {
    try {
        const equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!equipment) {
            return res.status(404).json(response(false, 'Equipment not found'));
        }

        res.json(response(true, 'Equipment updated', equipment));
    } catch (err) {
        next(err);
    }
};

// @desc    Soft delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private (Manager)
exports.deleteEquipment = async (req, res, next) => {
    try {
        const equipment = await Equipment.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });

        if (!equipment) {
            return res.status(404).json(response(false, 'Equipment not found'));
        }

        res.json(response(true, 'Equipment archived', equipment));
    } catch (err) {
        next(err);
    }
};

// @desc    Get requests for equipment
// @route   GET /api/equipment/:id/requests
// @access  Private
exports.getEquipmentRequests = async (req, res, next) => {
    try {
        const requests = await Request.find({ equipment: req.params.id }).populate('technician', 'name');
        res.json(response(true, 'Equipment requests', requests));
    } catch (err) {
        next(err);
    }
};
