const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, webhook, getHistory, getStatus, getPlans } = require('./payment.controller');
const { verifyToken } = require('../../middleware/auth');

router.post('/create-order', verifyToken, createOrder);
router.post('/verify', verifyToken, verifyPayment);
router.post('/webhook', webhook);
router.get('/history', verifyToken, getHistory);
router.get('/status', verifyToken, getStatus);
router.get('/plans', getPlans);

module.exports = router;
