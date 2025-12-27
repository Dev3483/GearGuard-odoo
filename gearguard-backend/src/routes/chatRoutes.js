const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/:requestId', getMessages);

module.exports = router;
