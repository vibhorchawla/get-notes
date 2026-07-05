const mongoose = require('mongoose');

const savedNoteSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        noteId: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

savedNoteSchema.index({ userId: 1, noteId: 1 }, { unique: true });

module.exports = mongoose.model('SavedNote', savedNoteSchema);
