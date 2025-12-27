const express = require('express');
const router = express.Router();
const { createTeam, getTeams, updateTeam, deleteTeam } = require('../controllers/teamController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.use(auth);

router.post('/', roleCheck('manager', 'admin'), createTeam);
router.get('/', getTeams);
router.patch('/:id', roleCheck('manager', 'admin'), updateTeam);
router.delete('/:id', roleCheck('admin'), deleteTeam);

module.exports = router;
