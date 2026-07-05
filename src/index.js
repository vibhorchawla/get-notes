require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

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
const { handleUpload, uploadFile, serveFile } = require('./modules/files/files.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
    res.json({ message: 'GetNotes API is running!', version: '1.0.0' });
});

// ── Routes ────────────────────────────────────────────────────────────────────
// Top-level search & share (avoids /api/notes/:courseId catching "search")
app.get('/api/search', searchNotesHandler);
app.post('/api/share-note', verifyToken, publishNote);
app.get('/api/note/:noteId', getNoteById);
app.post('/api/files/upload', verifyToken, handleUpload, uploadFile);
app.get('/api/files/:filename', serveFile);

app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/user', userRoutes);

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
connectDB()
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\nGetNotes API running on http://0.0.0.0:${PORT}`);
            console.log(`   Auth    -> POST /api/auth/register  |  POST /api/auth/login`);
            console.log(`   Courses -> GET  /api/courses         |  GET  /api/courses/featured`);
            console.log(`   Files   -> POST /api/files/upload   |  GET /api/files/:filename`);
            console.log(`   Search  -> GET  /api/search?q=     |  POST /api/share-note`);
            console.log(`   Notes   -> GET  /api/notes/search  |  POST /api/notes/publish`);
            console.log(`           GET  /api/notes/:courseId`);
            console.log(`   User    -> GET  /api/user/saved      |  GET  /api/user/downloads\n`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    });
