const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const paymentService = require('./payment.service');
const { JWT_SECRET } = require('../../middleware/auth');

// POST /api/payment/create-order
async function createOrder(req, res) {
    try {
        const { plan } = req.body;
        const order = await paymentService.createOrder(req.user.id, plan || 'monthly');
        res.json({ success: true, data: order });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ success: false, message: 'Failed to create payment order' });
    }
}

// POST /api/payment/verify
async function verifyPayment(req, res) {
    try {
        const { orderId, paymentId, signature } = req.body;

        if (!orderId || !paymentId || !signature) {
            return res.status(400).json({ success: false, message: 'orderId, paymentId, and signature are required' });
        }

        const user = await paymentService.verifyPayment(req.user.id, { orderId, paymentId, signature });

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, course: user.course, isPremium: user.isPremium, premiumPlan: user.premiumPlan, premiumStartDate: user.premiumStartDate, premiumEndDate: user.premiumEndDate, createdAt: user.createdAt },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Payment verified. Premium activated!',
            data: { token, user },
        });
    } catch (err) {
        console.error('Verify payment error:', err);
        const status = err.statusCode || 500;
        res.status(status).json({ success: false, message: err.message || 'Payment verification failed' });
    }
}

// POST /api/payment/webhook (no auth — Razorpay calls this)
async function webhook(req, res) {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        if (webhookSecret && signature) {
            const expected = crypto
                .createHmac('sha256', webhookSecret)
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (expected !== signature) {
                return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
            }
        }

        const { event, payload } = req.body;
        await paymentService.handleWebhook(event, payload);
        res.json({ success: true, message: 'Webhook received' });
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(200).json({ success: true, message: 'Webhook received with errors' });
    }
}

// GET /api/payment/history
async function getHistory(req, res) {
    try {
        const payments = await paymentService.getHistory(req.user.id);
        res.json({ success: true, data: payments });
    } catch (err) {
        console.error('Payment history error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch payment history' });
    }
}

// GET /api/payment/status
async function getStatus(req, res) {
    try {
        const { orderId } = req.query;
        if (!orderId) {
            return res.status(400).json({ success: false, message: 'orderId query parameter is required' });
        }
        const payment = await paymentService.getStatus(orderId);
        res.json({ success: true, data: payment });
    } catch (err) {
        console.error('Payment status error:', err);
        const status = err.statusCode || 500;
        res.status(status).json({ success: false, message: err.message || 'Failed to fetch payment status' });
    }
}

// GET /api/payment/plans
async function getPlans(req, res) {
    try {
        const plans = paymentService.getPlans();
        res.json({ success: true, data: plans });
    } catch (err) {
        console.error('Get plans error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch plans' });
    }
}

module.exports = { createOrder, verifyPayment, webhook, getHistory, getStatus, getPlans };
