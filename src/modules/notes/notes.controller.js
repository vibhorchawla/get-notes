const CommunityNote = require('../../models/CommunityNote');
const { NOTES, getAllCatalogNotes, findCatalogNoteById } = require('../../config/db');

// Shared: clean _id -> id from a lean Mongo doc
function cleanId(doc) {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc;
    return { ...rest, id: _id };
}

// GET /api/search?q=   and   GET /api/notes/search?q=
async function searchNotesHandler(req, res) {
    try {
        const { q = '' } = req.query;
        const query = String(q).trim();
        if (!query) {
            return res.json({ success: true, data: [] });
        }

        const catalog = getAllCatalogNotes();

        // Search community notes via regex (works without text index)
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const communityDocs = await CommunityNote.find({
            $or: [
                { title: regex },
                { content: regex },
                { subject: regex },
                { unit: regex },
                { 'uploadedBy.name': regex },
                { 'uploadedBy.course': regex },
            ],
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        const community = communityDocs.map((n) => ({ ...cleanId(n), source: 'community' }));

        // Filter catalog notes
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

// GET /api/note/:noteId   and   GET /api/notes/item/:noteId
async function getNoteById(req, res) {
    try {
        const { noteId } = req.params;

        const catalog = findCatalogNoteById(noteId);
        if (catalog) {
            return res.json({ success: true, data: catalog });
        }

        const note = await CommunityNote.findById(noteId).lean();
        if (note) {
            return res.json({ success: true, data: { ...cleanId(note), source: 'community' } });
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
        res.json({ success: true, data: notes.map(cleanId) });
    } catch (err) {
        console.error('GetMyNotes error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// POST /api/share-note   and   POST /api/notes/publish
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
            createdAt,
            updatedAt,
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
            isPublished: true,
        };

        if (createdAt) noteData.createdAt = createdAt;
        if (updatedAt) noteData.updatedAt = updatedAt;

        let note;
        if (id) {
            note = await CommunityNote.findByIdAndUpdate(id, noteData, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }).lean();
        } else {
            const doc = await CommunityNote.create(noteData);
            note = doc.toObject();
        }

        res.status(201).json({ success: true, data: cleanId(note) });
    } catch (err) {
        console.error('PublishNote error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

// GET /api/notes/:courseId
function getNotesByCourse(req, res) {
    const { courseId } = req.params;
    const courseNotes = NOTES[courseId];
    if (!courseNotes) {
        return res.status(404).json({ success: false, message: 'No notes found for this course' });
    }
    const notes = courseNotes.map((n) => ({ ...n, isPremium: n.isPremium || false }));
    res.json({ success: true, data: notes });
}

module.exports = {
    searchNotesHandler,
    getNoteById,
    getMyUploadedNotes,
    publishNote,
    getNotesByCourse,
};
