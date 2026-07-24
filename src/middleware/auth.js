const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'getnotes_secret_key_2026';

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}

async function requireAdmin(req, res, next) {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id).lean();
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        next();
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = { verifyToken, requireAdmin, JWT_SECRET };
