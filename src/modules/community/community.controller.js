const CommunityNote = require('../../models/CommunityNote');
const Subject = require('../../models/Subject');
const UserReputation = require('../../models/UserReputation');
const College = require('../../models/College');

function cleanId(doc) {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc;
    return { ...rest, id: _id };
}

async function getCommunityHome(req, res) {
    try {
        const [trending, topRated, recent, verified, subjects, contributors, colleges] = await Promise.all([
            CommunityNote.find({ isPublished: true }).sort({ downloads: -1, views: -1 }).limit(10).lean(),
            CommunityNote.find({ isPublished: true, ratingCount: { $gt: 0 } }).sort({ averageRating: -1 }).limit(10).lean(),
            CommunityNote.find({ isPublished: true }).sort({ createdAt: -1 }).limit(10).lean(),
            CommunityNote.find({ isPublished: true, isVerified: true }).sort({ createdAt: -1 }).limit(10).lean(),
            Subject.find({ isActive: true }).sort({ noteCount: -1 }).limit(10).lean(),
            UserReputation.find().sort({ points: -1 }).limit(10).lean(),
            College.find().sort({ noteCount: -1 }).limit(10).lean(),
        ]);

        res.json({
            success: true,
            data: {
                trending: trending.map(n => ({ ...cleanId(n), source: 'community' })),
                topRated: topRated.map(n => ({ ...cleanId(n), source: 'community' })),
                recent: recent.map(n => ({ ...cleanId(n), source: 'community' })),
                verified: verified.map(n => ({ ...cleanId(n), source: 'community' })),
                subjects: subjects.map(cleanId),
                contributors: contributors.map(cleanId),
                colleges: colleges.map(cleanId),
            },
        });
    } catch (err) {
        console.error('CommunityHome error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getCommunityNotesByType(req, res) {
    try {
        const { type } = req.params;
        const { sort = 'newest', page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        let filter = { isPublished: true };
        if (type === 'verified') filter.isVerified = true;
        if (type === 'previous-year') filter.tags = { $in: ['previous-year'] };
        if (type === 'assignment') filter.tags = { $in: ['assignment'] };
        if (type === 'lab-manual') filter.tags = { $in: ['lab-manual'] };
        if (type === 'question-bank') filter.tags = { $in: ['question-bank'] };

        let sortOption = { createdAt: -1 };
        if (sort === 'popular') sortOption = { downloads: -1 };
        else if (sort === 'rating') sortOption = { averageRating: -1 };
        else if (sort === 'downloads') sortOption = { downloads: -1 };

        const [notes, total] = await Promise.all([
            CommunityNote.find(filter).sort(sortOption).skip(skip).limit(parseInt(limit)).lean(),
            CommunityNote.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: {
                notes: notes.map(n => ({ ...cleanId(n), source: 'community' })),
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('CommunityNotesByType error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = { getCommunityHome, getCommunityNotesByType };
