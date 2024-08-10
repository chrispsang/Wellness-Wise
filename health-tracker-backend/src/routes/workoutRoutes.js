
const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const authenticateToken = require('../middleware/auth.js');

router.post('/', authenticateToken, workoutController.addWorkout);
router.get('/', authenticateToken, workoutController.getWorkouts);
router.put('/:id', authenticateToken, workoutController.updateWorkout); 
router.delete('/:id', authenticateToken, workoutController.deleteWorkout); 
router.get('/recommendations', authenticateToken, workoutController.getRecommendations);

module.exports = router;
