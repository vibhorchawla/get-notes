const { savedNotes, downloadedNotes, findNoteById } = require('../../config/db');

function ensureUserCollections(userId) {
    if (!savedNotes[userId]) savedNotes[userId] = new Set();
    if (!downloadedNotes[userId]) downloadedNotes[userId] = new Set();
}

// GET /api/user/saved
function getSaved(req, res) {
    const { id: userId } = req.user;
    ensureUserCollections(userId);
    const notes = Array.from(savedNotes[userId])
        .map(findNoteById)
        .filter(Boolean);
    res.json({ success: true, data: notes });
}

// POST /api/user/saved   body: { noteId }
function saveNote(req, res) {
    const { id: userId } = req.user;
    const { noteId } = req.body;
    if (!noteId) return res.status(400).json({ success: false, message: 'noteId is required' });
    const note = findNoteById(noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    ensureUserCollections(userId);
    savedNotes[userId].add(noteId);
    res.json({ success: true, message: 'Note saved' });
}

// DELETE /api/user/saved/:noteId
function unsaveNote(req, res) {
    const { id: userId } = req.user;
    const { noteId } = req.params;
    ensureUserCollections(userId);
    savedNotes[userId].delete(noteId);
    res.json({ success: true, message: 'Note removed from saved' });
}

// GET /api/user/downloads
function getDownloads(req, res) {
    const { id: userId } = req.user;
    ensureUserCollections(userId);
    const notes = Array.from(downloadedNotes[userId])
        .map(findNoteById)
        .filter(Boolean);
    res.json({ success: true, data: notes });
}

// POST /api/user/downloads   body: { noteId }
function addDownload(req, res) {
    const { id: userId } = req.user;
    const { noteId } = req.body;
    if (!noteId) return res.status(400).json({ success: false, message: 'noteId is required' });
    const note = findNoteById(noteId);
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    ensureUserCollections(userId);
    downloadedNotes[userId].add(noteId);
    res.json({ success: true, message: 'Download recorded' });
}

// GET /api/user/stats
function getStats(req, res) {
    const { id: userId } = req.user;
    ensureUserCollections(userId);
    res.json({
        success: true,
        data: {
            saved: savedNotes[userId].size,
            downloads: downloadedNotes[userId].size,
            notesRead: savedNotes[userId].size + downloadedNotes[userId].size,
        },
    });
}

module.exports = { getSaved, saveNote, unsaveNote, getDownloads, addDownload, getStats };
