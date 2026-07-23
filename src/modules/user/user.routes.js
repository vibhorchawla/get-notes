const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const { getSaved, saveNote, unsaveNote, getDownloads, addDownload, getStats, updateProfile } = require('./user.controller');

router.use(verifyToken);

router.get('/saved', getSaved);
router.post('/saved', saveNote);
router.delete('/saved/:noteId', unsaveNote);

router.get('/downloads', getDownloads);
router.post('/downloads', addDownload);

router.get('/stats', getStats);
router.put('/profile', updateProfile);

module.exports = router;
