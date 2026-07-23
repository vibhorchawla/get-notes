const Course = require('../../models/Course');
const Semester = require('../../models/Semester');
const Subject = require('../../models/Subject');
const CommunityNote = require('../../models/CommunityNote');

function cleanId(doc) {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc;
    return { ...rest, id: _id };
}

async function getAllCourses(req, res) {
    try {
        const courses = await Course.find({ isActive: true }).lean();
        res.json({ success: true, data: courses.map(cleanId) });
    } catch (err) {
        console.error('GetCourses error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getFeaturedCourses(req, res) {
    try {
        const featured = await CommunityNote.find({ isFeatured: true, isPublished: true })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();
        const subjects = await Subject.find({ isActive: true }).sort({ noteCount: -1 }).limit(6).lean();
        res.json({ success: true, data: { notes: featured.map(cleanId), subjects: subjects.map(cleanId) } });
    } catch (err) {
        console.error('GetFeatured error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getCategories(req, res) {
    try {
        const courses = await Course.find({ isActive: true }).lean();
        const categories = [...new Set(courses.map(c => c.category || 'Other').filter(Boolean))];
        res.json({ success: true, data: ['All', ...categories] });
    } catch (err) {
        res.json({ success: true, data: ['All'] });
    }
}

async function getCourseById(req, res) {
    try {
        const course = await Course.findById(req.params.id).lean();
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }
        res.json({ success: true, data: cleanId(course) });
    } catch (err) {
        console.error('GetCourse error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getCourseSemesters(req, res) {
    try {
        const semesters = await Semester.find({ courseId: req.params.courseId, isActive: true })
            .sort({ number: 1 })
            .lean();
        res.json({ success: true, data: semesters.map(cleanId) });
    } catch (err) {
        console.error('GetSemesters error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getSemesterSubjects(req, res) {
    try {
        const subjects = await Subject.find({ semesterId: req.params.semesterId, isActive: true })
            .sort({ name: 1 })
            .lean();
        res.json({ success: true, data: subjects.map(cleanId) });
    } catch (err) {
        console.error('GetSubjects error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getSubjectNotes(req, res) {
    try {
        const { subjectId } = req.params;
        const { sort, college } = req.query;

        let filter = { subjectId, isPublished: true };
        if (college) filter.uploaderCollege = college;

        let sortOption = { createdAt: -1 };
        if (sort === 'popular') sortOption = { downloads: -1 };
        else if (sort === 'rating') sortOption = { averageRating: -1 };
        else if (sort === 'downloads') sortOption = { downloads: -1 };
        else if (sort === 'verified') filter.isVerified = true;

        const notes = await CommunityNote.find(filter)
            .sort(sortOption)
            .limit(50)
            .lean();
        res.json({ success: true, data: notes.map(cleanId) });
    } catch (err) {
        console.error('GetSubjectNotes error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = {
    getAllCourses,
    getFeaturedCourses,
    getCategories,
    getCourseById,
    getCourseSemesters,
    getSemesterSubjects,
    getSubjectNotes,
};
