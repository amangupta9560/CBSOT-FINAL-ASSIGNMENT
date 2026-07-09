const express = require('express');
const {
  uploadPaper,
  getPapers,
  getPaperById,
  getPaperStatus,
  deletePaper,
  toggleBookmark,
  updateTags,
  getAgentOutputs,
  paperStatusCallback,
  triggerAgentTask,
  queryPaper,
} = require('../controllers/paperController');
const authMiddleware = require('../middleware/authMiddleware');
const { paperUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Webhook route: internal callback, no JWT required
router.post('/status-callback', paperStatusCallback);

// Protected routes: require JWT authMiddleware
router.use(authMiddleware);

router.post('/upload', paperUpload, uploadPaper);
router.get('/', getPapers);
router.get('/:id', getPaperById);
router.get('/:id/status', getPaperStatus);
router.get('/:id/query', queryPaper);
router.delete('/:id', deletePaper);
router.patch('/:id/bookmark', toggleBookmark);
router.patch('/:id/tags', updateTags);
router.get('/:id/agent-outputs', getAgentOutputs);
router.post('/:id/agent-task', triggerAgentTask);

module.exports = router;
