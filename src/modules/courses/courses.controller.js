const { CATEGORIES, COURSES, FEATURED_COURSES } = require('../../config/db');

// GET /api/courses
function getAllCourses(req, res) {
    res.json({ success: true, data: COURSES });
}

// GET /api/courses/featured
function getFeaturedCourses(req, res) {
    res.json({ success: true, data: FEATURED_COURSES });
}

// GET /api/courses/categories
function getCategories(req, res) {
    res.json({ success: true, data: CATEGORIES });
}

// GET /api/courses/:id
function getCourseById(req, res) {
    const course = COURSES.find((c) => c.id === req.params.id);
    if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, data: course });
}

module.exports = { getAllCourses, getFeaturedCourses, getCategories, getCourseById };
