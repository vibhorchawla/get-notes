const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Subject name is required'],
            trim: true,
        },
        semesterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Semester',
            required: [true, 'Semester reference is required'],
        },
        noteCount: {
            type: Number,
            default: 0,
        },
        icon: {
            type: String,
            default: 'document-text-outline',
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

subjectSchema.index({ semesterId: 1, name: 1 }, { unique: true });
subjectSchema.index({ name: 'text' });

module.exports = mongoose.model('Subject', subjectSchema);
