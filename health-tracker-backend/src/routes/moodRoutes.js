const express = require('express');
const router = express.Router();
const moodController = require('../controllers/moodController');
const authenticateToken = require('../middleware/auth.js');

router.post('/', authenticateToken, moodController.addMood);
router.get('/', authenticateToken, moodController.getMoods);
router.put('/:id', authenticateToken, moodController.updateMood);
router.delete('/:id', authenticateToken, moodController.deleteMood);
router.get('/trends', authenticateToken, moodController.getMoodTrends); 

module.exports = router;
