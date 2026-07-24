require("dotenv").config({ path: "./.env" });
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const authRoutes = require('./modules/auth/auth.routes');
const coursesRoutes = require('./modules/courses/courses.routes');
const notesRoutes = require('./modules/notes/notes.routes');
const userRoutes = require('./modules/user/user.routes');
const paymentRoutes = require('./modules/payment/payment.routes');
const communityRoutes = require('./modules/community/community.routes');
const collegesRoutes = require('./modules/colleges/colleges.routes');
const reputationRoutes = require('./modules/reputation/reputation.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const {
    searchNotesHandler,
    publishNote,
    getNoteById,
} = require('./modules/notes/notes.controller');
const { verifyToken } = require('./middleware/auth');
const { handleUpload, uploadFile, serveFile } = require('./modules/files/files.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (_req, res) => {
    res.json({ message: 'GetNotes API is running!', version: '2.0.0' });
});

app.get('/api/search', searchNotesHandler);
app.post('/api/share-note', verifyToken, publishNote);
app.get('/api/note/:noteId', getNoteById);
app.post('/api/files/upload', verifyToken, handleUpload, uploadFile);
app.get('/api/files/:filename', serveFile);

app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/colleges', collegesRoutes);
app.use('/api/reputation', reputationRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err.stack || err.message || err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

connectDB()
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\nGetNotes API v2.0.0 running on http://0.0.0.0:${PORT}`);
            console.log(`   Auth       -> POST /api/auth/register  |  POST /api/auth/login`);
            console.log(`   Courses    -> GET  /api/courses         |  GET  /api/courses/featured`);
            console.log(`               GET  /api/courses/:id/semesters`);
            console.log(`   Notes      -> GET  /api/notes/trending  |  GET  /api/notes/top-rated`);
            console.log(`               GET  /api/notes/recent      |  GET  /api/notes/verified`);
            console.log(`               GET  /api/notes/subject/:name`);
            console.log(`               POST /api/notes/publish     |  POST /api/notes/:id/rate`);
            console.log(`   Community  -> GET  /api/community       |  GET  /api/community/:type`);
            console.log(`   User       -> GET  /api/user/stats      |  PUT  /api/user/profile`);
            console.log(`   Reputation -> GET  /api/reputation/me   |  GET  /api/reputation/leaderboard`);
            console.log(`   Colleges   -> GET  /api/colleges        |  GET  /api/colleges/:name/notes`);
            console.log(`   Admin      -> POST /api/admin/notes/:id/verify`);
            console.log(`   Payment    -> POST /api/payment/create-order | POST /api/payment/verify\n`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB:', err.message);
        process.exit(1);
    });
