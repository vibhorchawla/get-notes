const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { users } = require('../../config/db');
const { JWT_SECRET } = require('../../middleware/auth');

// POST /api/auth/register
async function register(req, res) {
    try {
        const { email, password, name, course } = req.body;

        if (!email || !password || !name || !course) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const existing = users.find((u) => u.email === email.toLowerCase());
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = {
            id: uuidv4(),
            email: email.toLowerCase(),
            passwordHash,
            name,
            course,
            createdAt: new Date().toISOString(),
        };
        users.push(user);

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, course: user.course },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            data: { token, user: { id: user.id, email: user.email, name: user.name, course: user.course } },
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// POST /api/auth/login
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = users.find((u) => u.email === email.toLowerCase());
        if (!user) {
            return res.status(401).json({ success: false, message: 'No account found with this email. Please sign up first.' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, course: user.course },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            data: { token, user: { id: user.id, email: user.email, name: user.name, course: user.course } },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// GET /api/auth/me  (protected)
function me(req, res) {
    res.json({ success: true, user: req.user });
}

module.exports = { register, login, me };
