const mongoose = require('mongoose');

const BADGE_LEVELS = [
    { name: '🌟 Beginner', minPoints: 0 },
    { name: '📘 Contributor', minPoints: 100 },
    { name: '🏆 Top Contributor', minPoints: 500 },
    { name: '👑 Elite Contributor', minPoints: 2000 },
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
module.exports.getBadgeForPoints = getBadgeForPoints;
