const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const {
    getAllCourses,
    getFeaturedCourses,
    getCategories,
    getCourseById,
    getCourseSemesters,
    getSemesterSubjects,
    getSubjectNotes,
} = require('./courses.controller');

router.get('/', getAllCourses);
router.get('/featured', getFeaturedCourses);
router.get('/categories', getCategories);
router.get('/:courseId/semesters', getCourseSemesters);
router.get('/:id', getCourseById);

router.get('/semester/:semesterId/subjects', getSemesterSubjects);
router.get('/subject/:subjectId/notes', getSubjectNotes);

module.exports = router;
