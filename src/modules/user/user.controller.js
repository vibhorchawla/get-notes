const SavedNote = require('../../models/SavedNote');
const Download = require('../../models/Download');
const CommunityNote = require('../../models/CommunityNote');
const { findCatalogNoteById } = require('../../config/db');

async function resolveNote(noteId) {
    const catalog = findCatalogNoteById(noteId);
    if (catalog) return catalog;

    const doc = await CommunityNote.findById(noteId).lean();
    if (doc) return { ...doc, id: doc._id, source: 'community' };

    return null;
}

// GET /api/user/saved
async function getSaved(req, res) {
    try {
        const { id: userId } = req.user;
        const saved = await SavedNote.find({ userId }).lean();
        const notes = (
            await Promise.all(saved.map((s) => resolveNote(s.noteId)))
        ).filter(Boolean);
        res.json({ success: true, data: notes });
    } catch (err) {
        console.error('GetSaved error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// POST /api/user/saved   body: { noteId }
async function saveNote(req, res) {
    try {
        const { id: userId } = req.user;
        const { noteId } = req.body;
        if (!noteId) return res.status(400).json({ success: false, message: 'noteId is required' });

        const note = await resolveNote(noteId);
        if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

        await SavedNote.findOneAndUpdate(
            { userId, noteId },
            { userId, noteId },
            { upsert: true, new: true }
        );
        res.json({ success: true, message: 'Note saved' });
    } catch (err) {
        console.error('SaveNote error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// DELETE /api/user/saved/:noteId
async function unsaveNote(req, res) {
    try {
        const { id: userId } = req.user;
        const { noteId } = req.params;
        await SavedNote.deleteOne({ userId, noteId });
        res.json({ success: true, message: 'Note removed from saved' });
    } catch (err) {
        console.error('UnsaveNote error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// GET /api/user/downloads
async function getDownloads(req, res) {
    try {
        const { id: userId } = req.user;
        const downloads = await Download.find({ userId }).lean();
        const notes = (
            await Promise.all(downloads.map((d) => resolveNote(d.noteId)))
        ).filter(Boolean);
        res.json({ success: true, data: notes });
    } catch (err) {
        console.error('GetDownloads error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// POST /api/user/downloads   body: { noteId }
async function addDownload(req, res) {
    try {
        const { id: userId } = req.user;
        const { noteId } = req.body;
        if (!noteId) return res.status(400).json({ success: false, message: 'noteId is required' });

        const note = await resolveNote(noteId);
        if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

        await Download.findOneAndUpdate(
            { userId, noteId },
            { userId, noteId },
            { upsert: true, new: true }
        );
        res.json({ success: true, message: 'Download recorded' });
    } catch (err) {
        console.error('AddDownload error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// GET /api/user/stats
async function getStats(req, res) {
    try {
        const { id: userId } = req.user;
        const [saved, downloads] = await Promise.all([
            SavedNote.countDocuments({ userId }),
            Download.countDocuments({ userId }),
        ]);
        res.json({
            success: true,
            data: {
                saved,
                downloads,
                notesRead: saved + downloads,
            },
        });
    } catch (err) {
        console.error('GetStats error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = { getSaved, saveNote, unsaveNote, getDownloads, addDownload, getStats };
