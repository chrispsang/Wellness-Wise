
const express = require('express');
const router = express.Router();
const dietController = require('../controllers/dietController');
const authenticateToken = require('../middleware/auth.js');

router.post('/', authenticateToken, dietController.addDiet);
router.get('/', authenticateToken, dietController.getDiets);
router.put('/:id', authenticateToken, dietController.updateDiet); 
router.delete('/:id', authenticateToken, dietController.deleteDiet);
router.get('/recommendations', authenticateToken, dietController.getDietRecommendations);

module.exports = router;
