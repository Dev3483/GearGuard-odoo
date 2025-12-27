const Request = require('../models/Request');
const Equipment = require('../models/Equipment');
const response = require('../utils/response');

// @desc    Create request
// @route   POST /api/requests
// @access  Private (Requester/Manager)
exports.createRequest = async (req, res, next) => {
    try {
        const { subject, equipment: equipmentId, type, scheduledDate } = req.body;

        // Auto-fill logic
        const equipment = await Equipment.findById(equipmentId);
        if (!equipment) {
            return res.status(404).json(response(false, 'Equipment not found'));
        }

        const newRequest = new Request({
            subject,
            equipment: equipmentId,
            team: equipment.assignedTeam,
            technician: equipment.defaultTechnician,
            type,
            scheduledDate,
            createdBy: req.user.id
        });

        await newRequest.save();
        res.status(201).json(response(true, 'Request created', newRequest));
    } catch (err) {
        next(err);
    }
};

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private (Technician/Manager)
exports.getRequests = async (req, res, next) => {
    try {
        const { stage, page = 1, limit = 10 } = req.query;
        const query = {};
        if (stage) query.stage = stage;
        
        // If requester, only show their own
        if (req.user.role === 'requester') {
            query.createdBy = req.user.id;
        }

        const requests = await Request.find(query)
            .populate('equipment', 'name')
            .populate('team', 'name')
            .populate('technician', 'name')
            .populate('createdBy', 'name')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        
        const count = await Request.countDocuments(query);

        res.json(response(true, 'Requests list', {
             requests: requests.map(req => req.toObject({ virtuals: true })), // Ensure virtuals are included
             totalPages: Math.ceil(count / limit),
             currentPage: page
        }));
    } catch (err) {
        next(err);
    }
};

// @desc    Get my requests
// @route   GET /api/requests/my
// @access  Private (Requester)
exports.getMyRequests = async (req, res, next) => {
    try {
        const requests = await Request.find({ createdBy: req.user.id })
            .populate('equipment', 'name')
            .exec();
        res.json(response(true, 'My requests', requests.map(r => r.toObject({ virtuals: true }))));
    } catch (err) {
        next(err);
    }
};

// @desc    Get assigned requests
// @route   GET /api/requests/assigned
// @access  Private (Technician)
exports.getAssignedRequests = async (req, res, next) => {
    try {
        const requests = await Request.find({ technician: req.user.id })
            .populate('equipment', 'name')
            .exec();
        res.json(response(true, 'Assigned requests', requests.map(r => r.toObject({ virtuals: true }))));
    } catch (err) {
        next(err);
    }
};

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Private
exports.getRequestById = async (req, res, next) => {
    try {
        const request = await Request.findById(req.params.id)
            .populate('equipment')
            .populate('team')
            .populate('technician')
            .populate('createdBy');

        if (!request) {
            return res.status(404).json(response(false, 'Request not found'));
        }

        res.json(response(true, 'Request details', request.toObject({ virtuals: true })));
    } catch (err) {
        next(err);
    }
};

// @desc    Update request stage
// @route   PATCH /api/requests/:id/stage
// @access  Private (Technician/Manager)
exports.updateRequestStage = async (req, res, next) => {
    try {
        const { stage } = req.body;
        const request = await Request.findById(req.params.id);

        if (!request) {
            return res.status(404).json(response(false, 'Request not found'));
        }

        // Check ownership/role if strictly needed, but roleCheck handles generic access.
        
        request.stage = stage;
        await request.save();

        // Business Logic: If stage -> scrap, set equipment.status = scrapped
        if (stage === 'scrap') {
            await Equipment.findByIdAndUpdate(request.equipment, { status: 'scrapped' });
        }

        res.json(response(true, 'Request stage updated', request));
    } catch (err) {
        next(err);
    }
};

// @desc    Update request
// @route   PATCH /api/requests/:id
// @access  Private (Manager)
exports.updateRequest = async (req, res, next) => {
    try {
        const request = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!request) {
            return res.status(404).json(response(false, 'Request not found'));
        }
        res.json(response(true, 'Request updated', request));
    } catch (err) {
        next(err);
    }
};

// @desc    Delete request
// @route   DELETE /api/requests/:id
// @access  Private (Manager)
exports.deleteRequest = async (req, res, next) => {
    try {
        const request = await Request.findByIdAndDelete(req.params.id);
        if (!request) {
            return res.status(404).json(response(false, 'Request not found'));
        }
        res.json(response(true, 'Request deleted'));
    } catch (err) {
        next(err);
    }
};

// @desc    Get calendar requests
// @route   GET /api/requests/calendar
// @access  Private
exports.getCalendarRequests = async (req, res, next) => {
    try {
        const { date } = req.query; // YYYY-MM-DD
        if (!date) {
            return res.status(400).json(response(false, 'Date is required'));
        }
        
        // Find requests on that day (start of day to end of day)
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);

        const requests = await Request.find({
            scheduledDate: {
                $gte: start,
                $lt: end
            }
        });

        res.json(response(true, 'Calendar requests', requests));
    } catch (err) {
        next(err);
    }
};

// @desc    Get preventive requests
// @route   GET /api/requests/preventive
// @access  Private
exports.getPreventiveRequests = async (req, res, next) => {
    try {
        const requests = await Request.find({ type: 'preventive' });
        res.json(response(true, 'Preventive requests', requests));
    } catch (err) {
        next(err);
    }
};
