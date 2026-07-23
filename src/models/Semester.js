const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
    {
        number: {
            type: Number,
            required: [true, 'Semester number is required'],
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: [true, 'Course reference is required'],
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

semesterSchema.index({ courseId: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Semester', semesterSchema);
