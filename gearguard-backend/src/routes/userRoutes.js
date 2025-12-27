const express = require('express');
const router = express.Router();
const { getUsers, updateRole } = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', auth, roleCheck('manager', 'admin'), getUsers);
router.patch('/:id/role', auth, roleCheck('admin'), updateRole);

module.exports = router;
