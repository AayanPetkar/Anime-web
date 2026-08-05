const express = require('express');
const router = express.Router();
const controller = require('../controllers/skills.controller');

router.get('/', controller.getAllSkills);
router.get('/:id', controller.getSkillById);

module.exports = router;
