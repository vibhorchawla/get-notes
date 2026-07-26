const User = require('../../models/User');
const CommunityNote = require('../../models/CommunityNote');
const UserReputation = require('../../models/UserReputation');
const { getBadgeForPoints, BADGE_LEVELS, ACHIEVEMENT_DEFS } = require('../../models/UserReputation');

function cleanId(doc) {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc;
    return { ...rest, id: _id };
}

async function getContributorProfile(req, res) {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const { _id, __v, passwordHash, paymentHistory, ...userData } = user;
        userData.id = _id;

        let rep = await UserReputation.findOne({ userId }).lean();
        if (!rep) {
            rep = { points: 0, totalUploads: 0, totalDownloads: 0, totalViews: 0, totalLikes: 0, averageRating: 0, badges: [], achievements: [], activityLog: [] };
        }

        const uploadStats = await CommunityNote.aggregate([
            { $match: { 'uploadedBy.id': userId } },
            {
                $group: {
                    _id: null,
                    totalDownloads: { $sum: '$downloads' },
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' },
                    avgRating: { $avg: '$averageRating' },
                    noteCount: { $sum: 1 },
                },
            },
        ]);

        const stats = uploadStats[0] || {};
        const points = rep.points || 0;
        const currentBadge = getBadgeForPoints(points);

        const rank = await UserReputation.countDocuments({ points: { $gt: points } }) + 1;

        const achievedIds = (rep.achievements || []).map(a => a.id);
        const allAchievements = ACHIEVEMENT_DEFS.map(def => {
            const earned = achievedIds.includes(def.id);
            return { ...def, earned, earnedAt: earned ? (rep.achievements.find(a => a.id === def.id)?.earnedAt) : null };
        });

        res.json({
            success: true,
            data: {
                user: userData,
                reputation: {
                    points,
                    rank,
                    totalUploads: stats.noteCount || rep.totalUploads || 0,
                    totalDownloads: stats.totalDownloads || rep.totalDownloads || 0,
                    totalViews: stats.totalViews || rep.totalViews || 0,
                    totalLikes: stats.totalLikes || rep.totalLikes || 0,
                    averageRating: Math.round((stats.avgRating || 0) * 10) / 10,
                    currentBadge,
                    badges: rep.badges || [],
                },
                achievements: allAchievements,
                followerCount: rep.followerCount || 0,
                followingCount: rep.followingCount || 0,
            },
        });
    } catch (err) {
        console.error('GetContributorProfile error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getContributorNotes(req, res) {
    try {
        const { userId } = req.params;
        const { sort = 'newest', page = 1, limit = 20, q } = req.query;

        const filter = { 'uploadedBy.id': userId, isPublished: true };
        if (q) {
            const regex = new RegExp(q.trim(), 'i');
            filter.$or = [
                { title: regex },
                { subject: regex },
                { description: regex },
                { tags: regex },
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'popular' || sort === 'downloads') sortOption = { downloads: -1 };
        else if (sort === 'rating') sortOption = { averageRating: -1 };
        else if (sort === 'views') sortOption = { views: -1 };
        else if (sort === 'subject') sortOption = { subject: 1, createdAt: -1 };
        else if (sort === 'course') sortOption = { course: 1, createdAt: -1 };

        const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

        const [notes, total] = await Promise.all([
            CommunityNote.find(filter).sort(sortOption).skip(skip).limit(parseInt(limit)).lean(),
            CommunityNote.countDocuments(filter),
        ]);

        res.json({
            success: true,
            data: notes.map(n => ({ ...cleanId(n), source: 'community' })),
            pagination: {
                total,
                page: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('GetContributorNotes error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getContributorActivity(req, res) {
    try {
        const { userId } = req.params;
        const { limit = 30 } = req.query;

        let rep = await UserReputation.findOne({ userId }).lean();
        const activity = (rep?.activityLog || [])
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, parseInt(limit));

        res.json({ success: true, data: activity });
    } catch (err) {
        console.error('GetContributorActivity error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = { getContributorProfile, getContributorNotes, getContributorActivity };
