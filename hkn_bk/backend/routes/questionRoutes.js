const express = require('express');
const {
  togglePinQuestion,
  updateQuestionNote,
  addQuestionsToSession,
  updateUserAnswer 
} = require('../controllers/questionController');
const { protect } = require('../middlewares/authMiddleware');
const { protectKey2Career } = require('../middlewares/key2careerAuthMiddleware');

const router = express.Router();

router.post('/add', protectKey2Career, addQuestionsToSession);
router.post('/:id/pin', protectKey2Career, togglePinQuestion);
router.post('/:id/note', protectKey2Career, updateQuestionNote);
router.post('/:id/answer', protectKey2Career, updateUserAnswer); // ✅ Save user's answer

module.exports = router;