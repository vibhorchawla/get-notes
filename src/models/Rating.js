const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
    {
        noteId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CommunityNote',
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
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

ratingSchema.index({ noteId: 1, userId: 1 }, { unique: true });
ratingSchema.index({ noteId: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
