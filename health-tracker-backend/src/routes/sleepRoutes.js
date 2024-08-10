const express = require('express');
const router = express.Router();
const sleepController = require('../controllers/sleepController');
const authenticateToken = require('../middleware/auth.js');

router.post('/', authenticateToken, sleepController.addSleep);
router.get('/', authenticateToken, sleepController.getSleep);
router.put('/:id', authenticateToken, sleepController.updateSleep); 
router.delete('/:id', authenticateToken, sleepController.deleteSleep);
router.get('/recommendations', authenticateToken, sleepController.getSleepRecommendations);  

module.exports = router;
