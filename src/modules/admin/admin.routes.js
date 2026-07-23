const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const {
    verifyNote,
    featureNote,
    deleteNote,
    getReports,
    resolveReport,
    createCourse,
    addSemester,
    addSubject,
    banUser,
} = require('./admin.controller');

router.use(verifyToken);

router.post('/notes/:noteId/verify', verifyNote);
router.post('/notes/:noteId/feature', featureNote);
router.delete('/notes/:noteId', deleteNote);
router.get('/reports', getReports);
router.post('/reports/:reportId/resolve', resolveReport);
router.post('/courses', createCourse);
router.post('/semesters', addSemester);
router.post('/subjects', addSubject);
router.post('/users/:userId/ban', banUser);

module.exports = router;
