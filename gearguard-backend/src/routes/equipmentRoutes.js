const express = require('express');
const router = express.Router();
const { createEquipment, getEquipment, getEquipmentById, updateEquipment, deleteEquipment, getEquipmentRequests } = require('../controllers/equipmentController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { validateEquipment } = require('../validators/equipmentValidator');

router.use(auth);

router.post('/', roleCheck('manager', 'admin'), validateEquipment, createEquipment);
router.get('/', getEquipment);
router.get('/:id', getEquipmentById);
router.patch('/:id', roleCheck('manager', 'admin'), updateEquipment);
router.delete('/:id', roleCheck('manager', 'admin'), deleteEquipment);
router.get('/:id/requests', getEquipmentRequests);

module.exports = router;
