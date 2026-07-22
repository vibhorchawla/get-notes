const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        passwordHash: {
            type: String,
            default: null,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        course: {
            type: String,
            default: '',
            trim: true,
        },
        provider: {
            type: String,
            enum: ['email', 'google', 'facebook'],
            default: 'email',
        },
        providerId: {
            type: String,
            default: null,
        },
        isPremium: {
            type: Boolean,
            default: false,
        },
        premiumPlan: {
            type: String,
            enum: ['monthly', 'quarterly', 'yearly', null],
            default: null,
        },
        premiumStartDate: {
            type: Date,
            default: null,
        },
        premiumEndDate: {
            type: Date,
            default: null,
        },
        paymentHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Payment',
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                delete ret.passwordHash;
            },
        },
    }
);

module.exports = mongoose.model('User', userSchema);
