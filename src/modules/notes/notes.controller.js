const { NOTES } = require('../../config/db');

// GET /api/notes/:courseId
function getNotesByCourse(req, res) {
    const { courseId } = req.params;
    const notes = NOTES[courseId];
    if (!notes) {
        return res.status(404).json({ success: false, message: 'No notes found for this course' });
    }
    res.json({ success: true, data: notes });
}

module.exports = { getNotesByCourse };
