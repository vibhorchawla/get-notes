const mongoose = require('mongoose');

const communityNoteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Note title is required'],
            trim: true,
        },
        content: {
            type: String,
            default: '',
        },
        subject: {
            type: String,
            trim: true,
        },
        unit: {
            type: String,
            trim: true,
        },
        pdfUrl: {
            type: String,
        },
        playlistUrl: {
            type: String,
        },
        noteType: {
            type: String,
            enum: ['drive', 'pdf', 'playlist', 'mixed', 'text'],
            default: 'text',
        },
        uploadedBy: {
            id: { type: String, required: true },
            name: { type: String, required: true },
            course: { type: String },
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        isPremium: {
            type: Boolean,
            default: false,
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

communityNoteSchema.index({ 'uploadedBy.id': 1 });
communityNoteSchema.index({ title: 'text', content: 'text', subject: 'text', unit: 'text' });

module.exports = mongoose.model('CommunityNote', communityNoteSchema);
