const { v4: uuidv4 } = require('uuid');
const {
    NOTES,
    findNoteById,
    searchNotes,
    addCommunityNote,
    getCommunityNotesByUser,
} = require('../../config/db');

// GET /api/notes/search?q=
function searchNotesHandler(req, res) {
    const { q = '' } = req.query;
    const results = searchNotes(q).slice(0, 50);
    res.json({ success: true, data: results });
}

// GET /api/notes/item/:noteId
function getNoteById(req, res) {
    const { noteId } = req.params;
    const note = findNoteById(noteId);
    if (!note) {
        return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.json({ success: true, data: note });
}

// GET /api/notes/mine
function getMyUploadedNotes(req, res) {
    const { id: userId } = req.user;
    const notes = getCommunityNotesByUser(userId);
    res.json({ success: true, data: notes });
}

// POST /api/notes/publish
function publishNote(req, res) {
    const { id: userId, name, course } = req.user;
    const {
        id,
        title,
        content,
        subject,
        unit,
        pdfUrl,
        playlistUrl,
        noteType,
        createdAt,
        updatedAt,
    } = req.body;

    if (!title || !String(title).trim()) {
        return res.status(400).json({ success: false, message: 'Note title is required' });
    }

    const timestamp = new Date().toISOString();
    const note = {
        id: id || uuidv4(),
        title: String(title).trim(),
        content: content || '',
        subject: subject || undefined,
        unit: unit || undefined,
        pdfUrl: pdfUrl || undefined,
        playlistUrl: playlistUrl || undefined,
        noteType: noteType || 'text',
        uploadedBy: { id: userId, name, course },
        createdAt: createdAt || timestamp,
        updatedAt: updatedAt || timestamp,
    };

    addCommunityNote(note);
    res.status(201).json({ success: true, data: note });
}

// GET /api/notes/:courseId
function getNotesByCourse(req, res) {
    const { courseId } = req.params;
    const notes = NOTES[courseId];
    if (!notes) {
        return res.status(404).json({ success: false, message: 'No notes found for this course' });
    }
    res.json({ success: true, data: notes });
}

module.exports = {
    searchNotesHandler,
    getNoteById,
    getMyUploadedNotes,
    publishNote,
    getNotesByCourse,
};
