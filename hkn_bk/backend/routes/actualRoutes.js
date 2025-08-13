const express = require('express');
const { createActualSession, getMyActualSessions, getActualSessionById, saveActualAnswer, finalSubmitActualSession, saveActualUserFeedback, deleteActualSession, getAvailableTopics } = require('../controllers/actualController');
const { protect } = require('../middlewares/authMiddleware');
const { protectKey2Career } = require('../middlewares/key2careerAuthMiddleware');

const router = express.Router();

router.get('/available-topics', getAvailableTopics); // Public route - no authentication required
router.post('/create', protectKey2Career, createActualSession);
router.get('/my-sessions', protectKey2Career, getMyActualSessions);
router.get('/:id', protectKey2Career, getActualSessionById);
router.post('/answer/:questionId', protectKey2Career, saveActualAnswer);
router.post('/:id/submit', protectKey2Career, finalSubmitActualSession);
router.post('/:id/user-feedback', protectKey2Career, saveActualUserFeedback);
router.delete('/:id', protectKey2Career, deleteActualSession);

module.exports = router; 