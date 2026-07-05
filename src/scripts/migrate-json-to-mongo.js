/**
 * One-time migration script: JSON files -> MongoDB
 *
 * Usage:
 *   1. Set MONGODB_URI in src/.env
 *   2. Run: node src/scripts/migrate-json-to-mongo.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('../models/User');
const CommunityNote = require('../models/CommunityNote');

const USERS_FILE = path.join(__dirname, '..', 'config', 'users.json');
const NOTES_FILE = path.join(__dirname, '..', 'config', 'community_notes.json');

async function migrate() {
    console.log('[migrate] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[migrate] Connected.');

    // ── Users ──────────────────────────────────────────────────────────────
    if (fs.existsSync(USERS_FILE)) {
        const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
        console.log(`[migrate] Found ${users.length} users in users.json`);

        let imported = 0;
        for (const u of users) {
            try {
                await User.findOneAndUpdate(
                    { email: u.email },
                    {
                        email: u.email,
                        passwordHash: u.passwordHash,
                        name: u.name,
                        course: u.course,
                        createdAt: u.createdAt || new Date(),
                    },
                    { upsert: true, new: true }
                );
                imported++;
            } catch (err) {
                console.error(`[migrate] Skip user ${u.email}:`, err.message);
            }
        }
        console.log(`[migrate] Users imported: ${imported}/${users.length}`);
    } else {
        console.log('[migrate] users.json not found, skipping users.');
    }

    // ── Community Notes ────────────────────────────────────────────────────
    if (fs.existsSync(NOTES_FILE)) {
        const notes = JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
        console.log(`[migrate] Found ${notes.length} community notes`);

        let imported = 0;
        for (const n of notes) {
            try {
                await CommunityNote.findOneAndUpdate(
                    { _id: n.id },
                    {
                        title: n.title,
                        content: n.content || '',
                        subject: n.subject,
                        unit: n.unit,
                        pdfUrl: n.pdfUrl,
                        playlistUrl: n.playlistUrl,
                        noteType: n.noteType || 'text',
                        uploadedBy: n.uploadedBy || { id: 'unknown', name: 'Unknown' },
                        createdAt: n.createdAt || new Date(),
                        updatedAt: n.updatedAt || new Date(),
                    },
                    { upsert: true, new: true }
                );
                imported++;
            } catch (err) {
                console.error(`[migrate] Skip note ${n.id}:`, err.message);
            }
        }
        console.log(`[migrate] Community notes imported: ${imported}/${notes.length}`);
    } else {
        console.log('[migrate] community_notes.json not found, skipping notes.');
    }

    await mongoose.disconnect();
    console.log('[migrate] Done. Disconnected from MongoDB.');
}

migrate().catch((err) => {
    console.error('[migrate] Fatal error:', err);
    process.exit(1);
});
