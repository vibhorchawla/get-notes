const mongoose = require('mongoose');

const communityNoteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Note title is required'],
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        pdfUrl: {
            type: String,
        },
        thumbnail: {
            type: String,
        },
        playlistUrl: {
            type: String,
        },
        noteType: {
            type: String,
            enum: ['drive', 'pdf', 'playlist', 'mixed', 'text'],
            default: 'pdf',
        },
        course: {
            type: String,
            required: [true, 'Course is required'],
            trim: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
        },
        semester: {
            type: Number,
            required: [true, 'Semester is required'],
        },
        semesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Semester',
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
        },
        subjectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
        },
        unit: {
            type: String,
            trim: true,
        },
        tags: [{
            type: String,
            trim: true,
        }],
        uploadedBy: {
            id: { type: String, required: true },
            name: { type: String, required: true },
            course: { type: String },
            branch: { type: String, default: '' },
            college: { type: String, default: '' },
            avatar: { type: String, default: '' },
        },
        uploaderId: {
            type: String,
        },
        uploaderName: {
            type: String,
        },
        uploaderCollege: {
            type: String,
            default: '',
        },
        uploaderBranch: {
            type: String,
            default: '',
        },
        uploaderAvatar: {
            type: String,
            default: '',
        },
        downloads: {
            type: Number,
            default: 0,
        },
        views: {
            type: Number,
            default: 0,
        },
        saves: {
            type: Number,
            default: 0,
        },
        likes: {
            type: Number,
            default: 0,
        },
        likedBy: [{
            type: String,
        }],
        averageRating: {
            type: Number,
            default: 0,
        },
        ratingCount: {
            type: Number,
            default: 0,
        },
        reportCount: {
            type: Number,
            default: 0,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        needsReview: {
            type: Boolean,
            default: false,
        },
        isPremium: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'flagged'],
            default: 'approved',
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
communityNoteSchema.index({ courseId: 1, semester: 1, subjectId: 1 });
communityNoteSchema.index({ course: 1, semester: 1, subject: 1 });
communityNoteSchema.index({ title: 'text', description: 'text', subject: 'text', unit: 'text', tags: 'text', course: 'text' });
communityNoteSchema.index({ downloads: -1 });
communityNoteSchema.index({ views: -1 });
communityNoteSchema.index({ averageRating: -1 });
communityNoteSchema.index({ createdAt: -1 });
communityNoteSchema.index({ isFeatured: 1, createdAt: -1 });
communityNoteSchema.index({ isVerified: 1 });
communityNoteSchema.index({ uploaderCollege: 1 });

module.exports = mongoose.model('CommunityNote', communityNoteSchema);
