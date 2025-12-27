const { check, validationResult } = require('express-validator');
const response = require('../utils/response');

exports.validateEquipment = [
    check('name', 'Name is required').not().isEmpty(),
    check('serialNumber', 'Serial Number is required').not().isEmpty(),
    check('department', 'Department is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty(),
    check('purchaseDate', 'Purchase Date is required').isISO8601(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(response(false, 'Validation Error', errors.array()));
        }
        next();
    }
];
