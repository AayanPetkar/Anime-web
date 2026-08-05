const express = require('express');
const router = express.Router();
const controller = require('../controllers/progress.controller');

router.get('/:userId', controller.getUserProgress);
router.post('/:userId', controller.updateUserProgress);

module.exports = router;
