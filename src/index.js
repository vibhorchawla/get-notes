const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/auth.routes');
const coursesRoutes = require('./modules/courses/courses.routes');
const notesRoutes = require('./modules/notes/notes.routes');
const userRoutes = require('./modules/user/user.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
    res.json({ message: '🚀 GetNotes API is running!', version: '1.0.0' });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/user', userRoutes);

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 GetNotes API running on http://localhost:${PORT}`);
    console.log(`   Auth    → POST /api/auth/register  |  POST /api/auth/login`);
    console.log(`   Courses → GET  /api/courses         |  GET  /api/courses/featured`);
    console.log(`   Notes   → GET  /api/notes/:courseId`);
    console.log(`   User    → GET  /api/user/saved      |  GET  /api/user/downloads\n`);
});
