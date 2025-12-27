const express = require('express');
const router = express.Router();
const { 
    createRequest, 
    getRequests, 
    getMyRequests, 
    getAssignedRequests, 
    getRequestById, 
    updateRequestStage, 
    updateRequest, 
    deleteRequest,
    getCalendarRequests,
    getPreventiveRequests
} = require('../controllers/requestController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { validateRequest } = require('../validators/requestValidator');

router.use(auth);

// Specific paths must come before /:id generic path
router.get('/my', roleCheck('requester', 'technician', 'manager', 'admin'), getMyRequests); // Allow all maybe? Prompt said Requester.
router.get('/assigned', roleCheck('technician', 'manager', 'admin'), getAssignedRequests);
router.get('/calendar', getCalendarRequests); // Public to auth users
router.get('/preventive', getPreventiveRequests);

router.post('/', roleCheck('requester', 'manager', 'admin'), validateRequest, createRequest);
router.get('/', roleCheck('requester', 'technician', 'manager', 'admin'), getRequests);
router.get('/:id', getRequestById);
router.patch('/:id/stage', roleCheck('technician', 'manager', 'admin'), updateRequestStage);
router.patch('/:id', roleCheck('manager', 'admin'), updateRequest);
router.delete('/:id', roleCheck('manager', 'admin'), deleteRequest);

module.exports = router;
