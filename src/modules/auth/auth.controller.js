const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');
const User = require('../../models/User');
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

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({
            email: email.toLowerCase(),
            passwordHash,
            name,
            course,
        });

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, course: user.course, isPremium: user.isPremium, premiumPlan: user.premiumPlan, premiumStartDate: user.premiumStartDate, premiumEndDate: user.premiumEndDate },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            data: { token, user: { id: user.id, email: user.email, name: user.name, course: user.course, isPremium: user.isPremium, premiumPlan: user.premiumPlan, premiumStartDate: user.premiumStartDate, premiumEndDate: user.premiumEndDate } },
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

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ success: false, message: 'No account found with this email. Please sign up first.' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, course: user.course, isPremium: user.isPremium, premiumPlan: user.premiumPlan, premiumStartDate: user.premiumStartDate, premiumEndDate: user.premiumEndDate },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            data: { token, user: { id: user.id, email: user.email, name: user.name, course: user.course, isPremium: user.isPremium, premiumPlan: user.premiumPlan, premiumStartDate: user.premiumStartDate, premiumEndDate: user.premiumEndDate } },
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

// POST /api/auth/refresh  (protected)
function refresh(req, res) {
    try {
        const token = jwt.sign(
            { id: req.user.id, email: req.user.email, name: req.user.name, course: req.user.course, isPremium: req.user.isPremium, premiumPlan: req.user.premiumPlan, premiumStartDate: req.user.premiumStartDate, premiumEndDate: req.user.premiumEndDate },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        res.json({ success: true, data: { token } });
    } catch (err) {
        console.error('Refresh error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

function httpsGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// POST /api/auth/google
async function googleLogin(req, res) {
    try {
        const { idToken, name, course } = req.body;

        if (!idToken) {
            return res.status(400).json({ success: false, message: 'idToken is required' });
        }

        // Verify the idToken with Google's tokeninfo endpoint
        const googleData = await httpsGet(
            `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`
        );

        if (googleData.error_description || !googleData.email) {
            return res.status(401).json({ success: false, message: 'Invalid Google token' });
        }

        const email = googleData.email;
        const googleName = name || googleData.name || email.split('@')[0];
        const googleId = googleData.sub;

        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            // Existing user — update provider info if not set
            if (!user.providerId && !user.passwordHash) {
                user.provider = 'google';
                user.providerId = googleId;
                if (course && !user.course) user.course = course;
                await user.save();
            }
        } else {
            // Create new user
            user = await User.create({
                email: email.toLowerCase(),
                name: googleName,
                course: course || '',
                provider: 'google',
                providerId: googleId,
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, course: user.course, isPremium: user.isPremium, premiumPlan: user.premiumPlan, premiumStartDate: user.premiumStartDate, premiumEndDate: user.premiumEndDate },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            data: { token, user: { id: user.id, email: user.email, name: user.name, course: user.course, isPremium: user.isPremium, premiumPlan: user.premiumPlan, premiumStartDate: user.premiumStartDate, premiumEndDate: user.premiumEndDate } },
        });
    } catch (err) {
        console.error('Google login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// POST /api/auth/facebook
async function facebookLogin(req, res) {
    try {
        const { accessToken, name, course } = req.body;

        if (!accessToken) {
            return res.status(400).json({ success: false, message: 'accessToken is required' });
        }

        // Verify the access token with Facebook's Graph API
        const fbData = await httpsGet(
            `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email`
        );

        if (fbData.error || !fbData.id) {
            return res.status(401).json({ success: false, message: 'Invalid Facebook token' });
        }

        const email = fbData.email || `${fbData.id}@facebook.com`;
        const fbName = name || fbData.name || 'Facebook User';
        const fbId = fbData.id;

        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            if (!user.providerId && !user.passwordHash) {
                user.provider = 'facebook';
                user.providerId = fbId;
                if (course && !user.course) user.course = course;
                await user.save();
            }
        } else {
            user = await User.create({
                email: email.toLowerCase(),
                name: fbName,
                course: course || '',
                provider: 'facebook',
                providerId: fbId,
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, course: user.course, isPremium: user.isPremium, premiumPlan: user.premiumPlan, premiumStartDate: user.premiumStartDate, premiumEndDate: user.premiumEndDate },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            data: { token, user: { id: user.id, email: user.email, name: user.name, course: user.course, isPremium: user.isPremium, premiumPlan: user.premiumPlan, premiumStartDate: user.premiumStartDate, premiumEndDate: user.premiumEndDate } },
        });
    } catch (err) {
        console.error('Facebook login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = { register, login, me, refresh, googleLogin, facebookLogin };
