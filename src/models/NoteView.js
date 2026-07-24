const mongoose = require('mongoose');

const noteViewSchema = new mongoose.Schema(
    {
        noteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CommunityNote',
            required: true,
        },
        userId: {
            type: String,
            default: null,
        },
        ip: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

noteViewSchema.index({ noteId: 1, userId: 1 });
noteViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 * 30 });

module.exports = mongoose.model('NoteView', noteViewSchema);
