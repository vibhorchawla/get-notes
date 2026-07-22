const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        orderId: {
            type: String,
            required: [true, 'Razorpay order ID is required'],
            unique: true,
        },
        paymentId: {
            type: String,
            default: null,
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
        },
        currency: {
            type: String,
            default: 'INR',
        },
        status: {
            type: String,
            enum: ['created', 'paid', 'failed', 'refunded'],
            default: 'created',
        },
        signature: {
            type: String,
            default: null,
        },
        plan: {
            type: String,
            enum: ['monthly', 'quarterly', 'yearly'],
            default: 'monthly',
        },
        gateway: {
            type: String,
            default: 'razorpay',
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

module.exports = mongoose.model('Payment', paymentSchema);
