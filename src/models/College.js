const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'College name is required'],
            trim: true,
            unique: true,
        },
        city: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        noteCount: {
            type: Number,
            default: 0,
        },
        contributorCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
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

collegeSchema.index({ name: 1 });
collegeSchema.index({ noteCount: -1 });

module.exports = mongoose.model('College', collegeSchema);
