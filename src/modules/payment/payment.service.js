const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../../models/Payment');
const User = require('../../models/User');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLANS = {
    monthly: { amount: 4900, label: 'Monthly', days: 30 },
    quarterly: { amount: 12900, label: 'Quarterly', days: 90 },
    yearly: { amount: 39900, label: 'Yearly', days: 365 },
};

const CURRENCY = 'INR';

function getPlanConfig(planId) {
    const plan = PLANS[planId];
    if (!plan) {
        throw Object.assign(new Error(`Invalid plan: ${planId}`), { statusCode: 400 });
    }
    return plan;
}

function calculatePremiumEndDate(startDate, planId) {
    const plan = getPlanConfig(planId);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.days);
    return endDate;
}

async function createOrder(userId, planId) {
    const plan = getPlanConfig(planId);

    const options = {
        amount: plan.amount,
        currency: CURRENCY,
        receipt: `premium_${planId}_${userId}_${Date.now()}`,
        notes: {
            userId: userId.toString(),
            plan: planId,
            type: 'premium_subscription',
        },
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
        userId,
        orderId: order.id,
        amount: plan.amount,
        currency: CURRENCY,
        plan: planId,
        status: 'created',
    });

    return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        plan: planId,
    };
}

async function verifyPayment(userId, { orderId, paymentId, signature }) {
    const expected = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    if (expected !== signature) {
        throw Object.assign(new Error('Invalid payment signature'), { statusCode: 400 });
    }

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
        throw Object.assign(new Error('Payment record not found'), { statusCode: 404 });
    }
    if (payment.status === 'paid') {
        throw Object.assign(new Error('Payment already verified'), { statusCode: 409 });
    }

    payment.paymentId = paymentId;
    payment.signature = signature;
    payment.status = 'paid';
    await payment.save();

    const planId = payment.plan || 'monthly';
    const now = new Date();
    const premiumEndDate = calculatePremiumEndDate(now, planId);

    await User.findByIdAndUpdate(userId, {
        isPremium: true,
        premiumPlan: planId,
        premiumStartDate: now,
        premiumEndDate,
        $push: { paymentHistory: payment._id },
    });

    const user = await User.findById(userId);
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        course: user.course,
        isPremium: user.isPremium,
        premiumPlan: user.premiumPlan,
        premiumStartDate: user.premiumStartDate,
        premiumEndDate: user.premiumEndDate,
    };
}

async function getHistory(userId) {
    return Payment.find({ userId }).sort({ createdAt: -1 });
}

async function getStatus(orderId) {
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
        throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }
    return payment;
}

function getPlans() {
    return Object.entries(PLANS).map(([id, config]) => ({
        id,
        label: config.label,
        amount: config.amount,
        currency: CURRENCY,
        days: config.days,
    }));
}

async function handleWebhook(event, payload) {
    if (event === 'payment.captured' || event === 'payment.paid') {
        const paymentEntity = payload.payment?.entity || payload;
        const { order_id, id: paymentId, notes } = paymentEntity;
        const userId = notes?.userId;
        const planId = notes?.plan || 'monthly';

        if (userId && order_id) {
            const payment = await Payment.findOne({ orderId: order_id });
            if (payment && payment.status !== 'paid') {
                payment.paymentId = paymentId;
                payment.status = 'paid';
                payment.plan = planId;
                await payment.save();

                const now = new Date();
                const premiumEndDate = calculatePremiumEndDate(now, planId);
                await User.findByIdAndUpdate(userId, {
                    isPremium: true,
                    premiumPlan: planId,
                    premiumStartDate: now,
                    premiumEndDate,
                    $push: { paymentHistory: payment._id },
                });
            }
        }
    }
    return { received: true };
}

module.exports = { createOrder, verifyPayment, getHistory, getStatus, getPlans, handleWebhook };
