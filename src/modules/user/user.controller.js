const mongoose = require('mongoose');
const SavedNote = require('../../models/SavedNote');
const Download = require('../../models/Download');
const CommunityNote = require('../../models/CommunityNote');
const UserReputation = require('../../models/UserReputation');

function cleanId(doc) {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc;
    return { ...rest, id: _id };
}

async function resolveNote(noteId) {
    try {
        if (!mongoose.Types.ObjectId.isValid(noteId)) return null;
        const doc = await CommunityNote.findById(noteId).lean();
        if (doc) return { ...cleanId(doc), source: 'community' };
        return null;
    } catch (_) {
        return null;
    }
}

async function getSaved(req, res) {
    try {
        const { id: userId } = req.user;
        const saved = await SavedNote.find({ userId }).lean();
        const results = await Promise.allSettled(saved.map((s) => resolveNote(s.noteId)));
        const notes = results
            .filter((r) => r.status === 'fulfilled' && r.value)
            .map((r) => r.value);
        res.json({ success: true, data: notes });
    } catch (err) {
        console.error('GetSaved error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function saveNote(req, res) {
    try {
        const { id: userId } = req.user;
        const { noteId } = req.body;
        if (!noteId) return res.status(400).json({ success: false, message: 'noteId is required' });
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({ success: false, message: 'Invalid note ID' });
        }

        const existing = await SavedNote.findOne({ userId, noteId });
        if (existing) {
            return res.json({ success: true, message: 'Note already saved' });
        }

        await SavedNote.create({ userId, noteId });
        await CommunityNote.findByIdAndUpdate(noteId, { $inc: { saves: 1 } });
        res.json({ success: true, message: 'Note saved' });
    } catch (err) {
        console.error('SaveNote error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function unsaveNote(req, res) {
    try {
        const { id: userId } = req.user;
        const { noteId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({ success: false, message: 'Invalid note ID' });
        }
        const deleted = await SavedNote.deleteOne({ userId, noteId });
        if (deleted.deletedCount > 0) {
            await CommunityNote.findByIdAndUpdate(noteId, { $inc: { saves: -1 } });
        }
        res.json({ success: true, message: 'Note removed from saved' });
    } catch (err) {
        console.error('UnsaveNote error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getDownloads(req, res) {
    try {
        const { id: userId } = req.user;
        const downloadRecords = await Download.find({ userId }).lean();
        const results = await Promise.allSettled(downloadRecords.map((d) => resolveNote(d.noteId)));
        const notes = results
            .filter((r) => r.status === 'fulfilled' && r.value)
            .map((r) => r.value);
        res.json({ success: true, data: notes });
    } catch (err) {
        console.error('GetDownloads error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function addDownload(req, res) {
    try {
        const { id: userId } = req.user;
        const { noteId } = req.body;
        if (!noteId) return res.status(400).json({ success: false, message: 'noteId is required' });
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({ success: false, message: 'Invalid note ID' });
        }

        const existing = await Download.findOne({ userId, noteId });
        if (!existing) {
            await Download.create({ userId, noteId });
            await CommunityNote.findByIdAndUpdate(noteId, { $inc: { downloads: 1 } });
        }
        res.json({ success: true, message: 'Download recorded' });
    } catch (err) {
        console.error('AddDownload error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getStats(req, res) {
    try {
        const { id: userId } = req.user;
        const [saved, downloads, uploaded, reputation] = await Promise.all([
            SavedNote.countDocuments({ userId }),
            Download.countDocuments({ userId }),
            CommunityNote.countDocuments({ 'uploadedBy.id': userId }),
            UserReputation.findOne({ userId }).lean(),
        ]);

        const uploadStats = await CommunityNote.aggregate([
            { $match: { 'uploadedBy.id': userId } },
            {
                $group: {
                    _id: null,
                    totalDownloads: { $sum: '$downloads' },
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' },
                    avgRating: { $avg: '$averageRating' },
                },
            },
        ]);

        const stats = uploadStats[0] || {};
        const repPoints = reputation?.points || 0;
        const { getBadgeForPoints } = require('../../models/UserReputation');
        const badgeForPoints = getBadgeForPoints ? getBadgeForPoints(repPoints) : null;
        const repBadge = (badgeForPoints?.name) || reputation?.currentBadge?.name || '🌟 Beginner';

        res.json({
            success: true,
            data: {
                saved,
                downloads,
                notesRead: saved + downloads,
                uploaded,
                totalUploads: uploaded,
                downloadsReceived: stats.totalDownloads || 0,
                totalViews: stats.totalViews || 0,
                totalLikes: stats.totalLikes || 0,
                averageRating: Math.round((stats.avgRating || 0) * 10) / 10,
                reputationPoints: repPoints,
                badge: repBadge,
                rank: reputation?.rank || 0,
            },
        });
    } catch (err) {
        console.error('GetStats error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function updateProfile(req, res) {
    try {
        const { name, course, branch, college, currentSemester, graduationYear, bio, socialLinks } = req.body;
        const User = require('../../models/User');
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET;
        const update = {};
        if (name) update.name = name;
        if (course !== undefined) update.course = course;
        if (branch !== undefined) update.branch = branch;
        if (college !== undefined) update.college = college;
        if (currentSemester !== undefined) update.currentSemester = currentSemester ? Number(currentSemester) : null;
        if (graduationYear !== undefined) update.graduationYear = graduationYear ? Number(graduationYear) : null;
        if (bio !== undefined) update.bio = bio;
        if (socialLinks !== undefined) update.socialLinks = socialLinks;

        await User.findByIdAndUpdate(req.user.id, update);

        if (college) {
            const College = require('../../models/College');
            await College.findOneAndUpdate(
                { name: college },
                { $inc: { contributorCount: 1 } },
                { upsert: true }
            );
        }

        const user = await User.findById(req.user.id).lean();

        const newToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
                name: user.name,
                course: user.course,
                branch: user.branch || '',
                college: user.college || '',
                avatar: user.avatar || '',
                isPremium: user.isPremium,
                premiumPlan: user.premiumPlan,
                premiumStartDate: user.premiumStartDate,
                premiumEndDate: user.premiumEndDate,
                createdAt: user.createdAt,
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ success: true, data: cleanId(user), token: newToken });
    } catch (err) {
        console.error('UpdateProfile error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = { getSaved, saveNote, unsaveNote, getDownloads, addDownload, getStats, updateProfile };
