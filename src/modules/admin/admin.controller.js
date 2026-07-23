const CommunityNote = require('../../models/CommunityNote');
const UserReputation = require('../../models/UserReputation');
const Subject = require('../../models/Subject');
const Course = require('../../models/Course');
const College = require('../../models/College');
const Report = require('../../models/Report');

function cleanId(doc) {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc;
    return { ...rest, id: _id };
}

async function verifyNote(req, res) {
    try {
        const { noteId } = req.params;
        const note = await CommunityNote.findByIdAndUpdate(noteId, { isVerified: true }, { new: true }).lean();
        if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

        await UserReputation.findOneAndUpdate(
            { userId: note.uploadedBy.id },
            { $inc: { points: 100 } },
            { upsert: true }
        );

        res.json({ success: true, data: cleanId(note) });
    } catch (err) {
        console.error('VerifyNote error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function featureNote(req, res) {
    try {
        const { noteId } = req.params;
        const note = await CommunityNote.findByIdAndUpdate(noteId, { isFeatured: true }, { new: true }).lean();
        if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
        res.json({ success: true, data: cleanId(note) });
    } catch (err) {
        console.error('FeatureNote error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function deleteNote(req, res) {
    try {
        const { noteId } = req.params;
        await CommunityNote.findByIdAndDelete(noteId);
        res.json({ success: true, message: 'Note deleted' });
    } catch (err) {
        console.error('DeleteNote error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getReports(req, res) {
    try {
        const reports = await Report.find({ status: 'pending' }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, data: reports.map(cleanId) });
    } catch (err) {
        console.error('GetReports error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function resolveReport(req, res) {
    try {
        const { reportId } = req.params;
        const { action } = req.body;
        await Report.findByIdAndUpdate(reportId, { status: action === 'dismiss' ? 'dismissed' : 'resolved' });
        res.json({ success: true, message: 'Report resolved' });
    } catch (err) {
        console.error('ResolveReport error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function createCourse(req, res) {
    try {
        const { name, icon, category } = req.body;
        const course = await Course.create({ name, icon, category });
        res.status(201).json({ success: true, data: cleanId(course.toObject()) });
    } catch (err) {
        console.error('CreateCourse error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function addSemester(req, res) {
    try {
        const { courseId, number } = req.body;
        const semester = require('../../models/Semester');
        const doc = await semester.create({ courseId, number });
        res.status(201).json({ success: true, data: cleanId(doc.toObject()) });
    } catch (err) {
        console.error('AddSemester error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function addSubject(req, res) {
    try {
        const { name, semesterId } = req.body;
        const doc = await Subject.create({ name, semesterId });
        res.status(201).json({ success: true, data: cleanId(doc.toObject()) });
    } catch (err) {
        console.error('AddSubject error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function banUser(req, res) {
    try {
        const { userId } = req.params;
        await CommunityNote.updateMany(
            { 'uploadedBy.id': userId },
            { isPublished: false }
        );
        res.json({ success: true, message: 'User banned and notes hidden' });
    } catch (err) {
        console.error('BanUser error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = {
    verifyNote,
    featureNote,
    deleteNote,
    getReports,
    resolveReport,
    createCourse,
    addSemester,
    addSubject,
    banUser,
};
