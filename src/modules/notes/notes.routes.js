const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const {
    searchNotesHandler,
    getNoteById,
    getMyUploadedNotes,
    publishNote,
    getTrendingNotes,
    getTopRatedNotes,
    getRecentNotes,
    getVerifiedNotes,
    getNotesBySubject,
    getRelatedNotes,
    rateNote,
    reportNote,
    incrementDownloads,
    likeNote,
    getPopularSubjects,
    getTopContributors,
} = require('./notes.controller');

router.get('/search', searchNotesHandler);
router.get('/trending', getTrendingNotes);
router.get('/top-rated', getTopRatedNotes);
router.get('/recent', getRecentNotes);
router.get('/verified', getVerifiedNotes);
router.get('/popular-subjects', getPopularSubjects);
router.get('/top-contributors', getTopContributors);
router.get('/mine', verifyToken, getMyUploadedNotes);
router.get('/item/:noteId', getNoteById);
router.get('/subject/:subjectName', getNotesBySubject);
router.get('/:noteId/related', getRelatedNotes);

router.post('/publish', verifyToken, publishNote);
router.post('/:noteId/rate', verifyToken, rateNote);
router.post('/:noteId/report', verifyToken, reportNote);
router.post('/:noteId/download', verifyToken, incrementDownloads);
router.post('/:noteId/like', verifyToken, likeNote);

module.exports = router;
