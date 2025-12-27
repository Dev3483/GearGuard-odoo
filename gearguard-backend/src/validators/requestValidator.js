const { check, validationResult } = require('express-validator');
const response = require('../utils/response');

exports.validateRequest = [
    check('subject', 'Subject is required').not().isEmpty(),
    check('equipment', 'Equipment ID is required').isMongoId(),
    check('type', 'Type is required and must be corrective or preventive').isIn(['corrective', 'preventive']),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(response(false, 'Validation Error', errors.array()));
        }
        next();
    }
];
