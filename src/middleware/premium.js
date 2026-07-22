const User = require('../models/User');

/**
 * Middleware that ensures the authenticated user has an active premium subscription.
 * Must be used after verifyToken so req.user is populated.
 */
async function requirePremium(req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const now = new Date();
        if (!user.isPremium || (user.premiumEndDate && new Date(user.premiumEndDate) < now)) {
            if (user.premiumEndDate && new Date(user.premiumEndDate) < now) {
                await User.findByIdAndUpdate(user._id, { isPremium: false, premiumPlan: null, premiumStartDate: null, premiumEndDate: null });
            }
            return res.status(403).json({ success: false, message: 'Premium subscription required' });
        }
        next();
    } catch (err) {
        console.error('Premium middleware error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = { requirePremium };
