const express = require('express');
const {
  createSession,
  getSessionById,
  getMySessions,
  deleteSession,
  finalSubmitSession,
  saveUserFeedback
} = require('../controllers/sessionController');
const { protect } = require('../middlewares/authMiddleware');
const { protectKey2Career } = require('../middlewares/key2careerAuthMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/create', protectKey2Career, createSession);
router.get('/my-sessions', protectKey2Career, getMySessions);
router.get('/:id', protectKey2Career, getSessionById);
router.delete('/:id', protectKey2Career, deleteSession);
router.post('/:id/submit', protectKey2Career, finalSubmitSession); // ✅ Now this works
router.post('/:id/user-feedback', protectKey2Career, saveUserFeedback);
router.post('/upload-pdf', protectKey2Career, upload.single('pdf'), require('../controllers/sessionController').uploadSessionPDF);

module.exports = router;