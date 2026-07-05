const CommunityNote = require('../../models/CommunityNote');
const { NOTES, getAllCatalogNotes, findCatalogNoteById } = require('../../config/db');

// GET /api/notes/search?q=   and   GET /api/search?q=
async function searchNotesHandler(req, res) {
    try {
        const { q = '' } = req.query;
        const query = String(q).trim();
        if (!query) {
            return res.json({ success: true, data: [] });
        }

        const catalog = getAllCatalogNotes();

        let community = [];
        try {
            community = await CommunityNote.find(
                { $text: { $search: query } },
                { score: { $meta: 'textScore' } }
            )
                .sort({ score: { $meta: 'textScore' } })
                .limit(50)
                .lean();
            community = community.map((n) => ({ ...n, id: n._id, source: 'community' }));
        } catch {
            // Text index may not exist yet — fall back to regex
            const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            community = await CommunityNote.find({
                $or: [
                    { title: regex },
                    { content: regex },
                    { subject: regex },
                    { unit: regex },
                    { 'uploadedBy.name': regex },
                    { 'uploadedBy.course': regex },
                ],
            })
                .limit(50)
                .lean();
            community = community.map((n) => ({ ...n, id: n._id, source: 'community' }));
        }

        const qLower = query.toLowerCase();
        const filteredCatalog = catalog.filter((note) => {
            const text = [note.title, note.subject, note.unit, note.content]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return text.includes(qLower);
        });

        const results = [...filteredCatalog, ...community].slice(0, 50);
        res.json({ success: true, data: results });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ success: false, message: 'Search failed' });
    }
}

// GET /api/notes/item/:noteId   and   GET /api/note/:noteId
async function getNoteById(req, res) {
    try {
        const { noteId } = req.params;

        const catalog = findCatalogNoteById(noteId);
        if (catalog) {
            return res.json({ success: true, data: catalog });
        }

        const note = await CommunityNote.findById(noteId).lean();
        if (note) {
            return res.json({ success: true, data: { ...note, id: note._id, source: 'community' } });
        }

        return res.status(404).json({ success: false, message: 'Note not found' });
    } catch (err) {
        console.error('GetNote error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// GET /api/notes/mine
async function getMyUploadedNotes(req, res) {
    try {
        const { id: userId } = req.user;
        const notes = await CommunityNote.find({ 'uploadedBy.id': userId })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, data: notes.map((n) => ({ ...n, id: n._id })) });
    } catch (err) {
        console.error('GetMyNotes error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// POST /api/notes/publish   and   POST /api/share-note
async function publishNote(req, res) {
    try {
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
        } = req.body;

        if (!title || !String(title).trim()) {
            return res.status(400).json({ success: false, message: 'Note title is required' });
        }

        const noteData = {
            title: String(title).trim(),
            content: content || '',
            subject: subject || undefined,
            unit: unit || undefined,
            pdfUrl: pdfUrl || undefined,
            playlistUrl: playlistUrl || undefined,
            noteType: noteType || 'text',
            uploadedBy: { id: userId, name, course },
        };

        let note;
        if (id) {
            note = await CommunityNote.findByIdAndUpdate(id, noteData, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }).lean();
        } else {
            note = await CommunityNote.create(noteData);
            note = note.toObject();
        }

        res.status(201).json({ success: true, data: { ...note, id: note._id } });
    } catch (err) {
        console.error('PublishNote error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
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
