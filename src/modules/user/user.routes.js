const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const { getSaved, saveNote, unsaveNote, getDownloads, addDownload, getStats } = require('./user.controller');

// All user routes require a valid token
router.use(verifyToken);

router.get('/saved', getSaved);
router.post('/saved', saveNote);
router.delete('/saved/:noteId', unsaveNote);

router.get('/downloads', getDownloads);
router.post('/downloads', addDownload);

router.get('/stats', getStats);

module.exports = router;
