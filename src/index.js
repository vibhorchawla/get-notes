const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/auth.routes');
const coursesRoutes = require('./modules/courses/courses.routes');
const notesRoutes = require('./modules/notes/notes.routes');
const userRoutes = require('./modules/user/user.routes');
const {
    searchNotesHandler,
    publishNote,
    getNoteById,
} = require('./modules/notes/notes.controller');
const { verifyToken } = require('./middleware/auth');

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
// Top-level search & share (avoids /api/notes/:courseId catching "search")
app.get('/api/search', searchNotesHandler);
app.post('/api/share-note', verifyToken, publishNote);
app.get('/api/note/:noteId', getNoteById);

app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/user', userRoutes);

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 GetNotes API running on http://0.0.0.0:${PORT}`);
    console.log(`   Auth    → POST /api/auth/register  |  POST /api/auth/login`);
    console.log(`   Courses → GET  /api/courses         |  GET  /api/courses/featured`);
    console.log(`   Search  → GET  /api/search?q=     |  POST /api/share-note`);
    console.log(`   Notes   → GET  /api/notes/search  |  POST /api/notes/publish`);
    console.log(`           GET  /api/notes/:courseId`);
    console.log(`   User    → GET  /api/user/saved      |  GET  /api/user/downloads\n`);
});
