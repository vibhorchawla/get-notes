const UserReputation = require('../../models/UserReputation');
const CommunityNote = require('../../models/CommunityNote');
const { getBadgeForPoints } = require('../../models/UserReputation');

function cleanId(doc) {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc;
    return { ...rest, id: _id };
}

async function getMyReputation(req, res) {
    try {
        const userId = req.user.id;
        let rep = await UserReputation.findOne({ userId }).lean();
        if (!rep) {
            rep = await UserReputation.create({ userId });
            rep = rep.toObject();
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
                },
            },
        ]);

        const points = rep?.points || 0;
        const currentBadge = UserReputation.getBadgeForPoints ? UserReputation.getBadgeForPoints(points) : (rep?.currentBadge || { name: '🌟 Beginner' });

        res.json({
            success: true,
            data: {
                ...cleanId(rep),
                ...(uploadStats[0] || {}),
                currentBadge,
            },
        });
    } catch (err) {
        console.error('GetReputation error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getLeaderboard(req, res) {
    try {
        const leaders = await UserReputation.find()
            .sort({ points: -1 })
            .limit(100)
            .lean();

        const withBadges = leaders.map((l, i) => ({
            ...cleanId(l),
            rank: i + 1,
            currentBadge: getBadgeForPoints(l.points),
        }));

        res.json({ success: true, data: withBadges });
    } catch (err) {
        console.error('Leaderboard error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = { getMyReputation, getLeaderboard };
