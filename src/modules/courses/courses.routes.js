const express = require('express');
const router = express.Router();
const { getAllCourses, getFeaturedCourses, getCategories, getCourseById } = require('./courses.controller');

router.get('/', getAllCourses);
router.get('/featured', getFeaturedCourses);
router.get('/categories', getCategories);
router.get('/:id', getCourseById);

module.exports = router;
