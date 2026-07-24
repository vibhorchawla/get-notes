const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
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

downloadSchema.index({ userId: 1, noteId: 1 });

module.exports = mongoose.model('Download', downloadSchema);
