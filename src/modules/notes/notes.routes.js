const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const {
    searchNotesHandler,
    getNoteById,
    getMyUploadedNotes,
    publishNote,
    getNotesByCourse,
} = require('./notes.controller');

router.get('/search', searchNotesHandler);
router.get('/mine', verifyToken, getMyUploadedNotes);
router.get('/item/:noteId', getNoteById);
router.post('/publish', verifyToken, publishNote);
router.get('/:courseId', getNotesByCourse);

module.exports = router;
