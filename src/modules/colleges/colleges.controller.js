const College = require('../../models/College');
const CommunityNote = require('../../models/CommunityNote');

function cleanId(doc) {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc;
    return { ...rest, id: _id };
}

async function getColleges(req, res) {
    try {
        const colleges = await College.find().sort({ noteCount: -1 }).limit(50).lean();
        res.json({ success: true, data: colleges.map(cleanId) });
    } catch (err) {
        console.error('GetColleges error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getCollegeNotes(req, res) {
    try {
        const { collegeName } = req.params;
        const notes = await CommunityNote.find({ uploaderCollege: collegeName, isPublished: true })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        res.json({ success: true, data: notes.map(n => ({ ...cleanId(n), source: 'community' })) });
    } catch (err) {
        console.error('CollegeNotes error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = { getColleges, getCollegeNotes };
