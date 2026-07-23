const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        noteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CommunityNote',
            required: true,
        },
        reportedBy: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            required: true,
            enum: [
                'copyright',
                'inappropriate',
                'spam',
                'wrong_subject',
                'duplicate',
                'other',
            ],
        },
        description: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
            default: 'pending',
        },
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

reportSchema.index({ noteId: 1 });

module.exports = mongoose.model('Report', reportSchema);
