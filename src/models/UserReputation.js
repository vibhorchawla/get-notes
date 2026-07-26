const mongoose = require('mongoose');

const BADGE_LEVELS = [
    { name: '🌟 Beginner', minPoints: 0 },
    { name: '📘 Contributor', minPoints: 100 },
    { name: '🏆 Top Contributor', minPoints: 500 },
    { name: '👑 Elite Contributor', minPoints: 2000 },
];

const ACHIEVEMENT_DEFS = [
    { id: 'first_upload', name: 'First Upload', description: 'Uploaded your first note', icon: '📄', threshold: 1, field: 'totalUploads' },
    { id: 'uploads_10', name: '10 Uploads', description: 'Uploaded 10 notes', icon: '📚', threshold: 10, field: 'totalUploads' },
    { id: 'downloads_100', name: '100 Downloads', description: 'Received 100 downloads', icon: '📥', threshold: 100, field: 'totalDownloads' },
    { id: 'downloads_500', name: '500 Downloads', description: 'Received 500 downloads', icon: '🎉', threshold: 500, field: 'totalDownloads' },
    { id: 'downloads_1000', name: '1000 Downloads', description: 'Received 1000 downloads', icon: '🔥', threshold: 1000, field: 'totalDownloads' },
    { id: 'likes_100', name: '100 Likes', description: 'Received 100 likes', icon: '❤️', threshold: 100, field: 'totalLikes' },
    { id: 'views_10000', name: '10K Views', description: '10,000 total views', icon: '👀', threshold: 10000, field: 'totalViews' },
    { id: 'top_rated', name: 'Top Rated', description: 'Average rating above 4.5', icon: '⭐', threshold: 4.5, field: 'averageRating' },
    { id: 'verified', name: 'Verified Contributor', description: 'Account verified by admin', icon: '✅', threshold: 1, field: 'isVerified' },
    { id: 'community_helper', name: 'Community Helper', description: '50+ downloads on a single note', icon: '🤝', threshold: 50, field: 'singleNoteDownloads' },
];

const userReputationSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        points: {
            type: Number,
            default: 0,
        },
        rank: {
            type: Number,
            default: 0,
        },
        totalUploads: {
            type: Number,
            default: 0,
        },
        totalDownloads: {
            type: Number,
            default: 0,
        },
        totalViews: {
            type: Number,
            default: 0,
        },
        totalLikes: {
            type: Number,
            default: 0,
        },
        averageRating: {
            type: Number,
            default: 0,
        },
        reportsReceived: {
            type: Number,
            default: 0,
        },
        badges: [
            {
                name: String,
                earnedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        achievements: [
            {
                id: { type: String, required: true },
                name: { type: String, required: true },
                description: { type: String },
                icon: { type: String },
                earnedAt: { type: Date, default: Date.now },
            },
        ],
        activityLog: [
            {
                type: { type: String, required: true },
                noteId: { type: String },
                noteTitle: { type: String },
                value: { type: mongoose.Schema.Types.Mixed },
                timestamp: { type: Date, default: Date.now },
            },
        ],
        followerCount: { type: Number, default: 0 },
        followingCount: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

userReputationSchema.virtual('currentBadge').get(function () {
    let badge = BADGE_LEVELS[0];
    for (const level of BADGE_LEVELS) {
        if (this.points >= level.minPoints) {
            badge = level;
        }
    }
    return badge;
});

userReputationSchema.set('toJSON', { virtuals: true });
userReputationSchema.set('toObject', { virtuals: true });

function getBadgeForPoints(points) {
    let badge = BADGE_LEVELS[0];
    for (const level of BADGE_LEVELS) {
        if (points >= level.minPoints) {
            badge = level;
        }
    }
    return badge;
}

module.exports = mongoose.model('UserReputation', userReputationSchema);
module.exports.BADGE_LEVELS = BADGE_LEVELS;
module.exports.ACHIEVEMENT_DEFS = ACHIEVEMENT_DEFS;
module.exports.getBadgeForPoints = getBadgeForPoints;
