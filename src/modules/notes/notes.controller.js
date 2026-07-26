const mongoose = require('mongoose');
const CommunityNote = require('../../models/CommunityNote');
const Subject = require('../../models/Subject');
const Course = require('../../models/Course');
const Semester = require('../../models/Semester');
const Rating = require('../../models/Rating');
const Report = require('../../models/Report');
const NoteView = require('../../models/NoteView');
const UserReputation = require('../../models/UserReputation');

function cleanId(doc) {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc;
    return { ...rest, id: _id };
}

const REPUTATION_POINTS = {
    UPLOAD: 50,
    DOWNLOAD: 2,
    LIKE: 5,
    RATING_5: 10,
    RATING_4: 5,
    RATING_3: 2,
    VERIFIED_BONUS: 100,
    REPORT_PENALTY: -20,
};

const BADGE_LEVELS = [
    { name: 'Beginner', minPoints: 0 },
    { name: 'Contributor', minPoints: 100 },
    { name: 'Top Contributor', minPoints: 500 },
    { name: 'Elite Contributor', minPoints: 2000 },
];

function getBadgeForPoints(points) {
    let badge = BADGE_LEVELS[0];
    for (const level of BADGE_LEVELS) {
        if (points >= level.minPoints) badge = level;
    }
    return badge.name;
}

async function updateReputation(userId, field, increment) {
    try {
        const update = {};
        update[field] = increment;
        await UserReputation.findOneAndUpdate(
            { userId },
            { $inc: update },
            { upsert: true }
        );
    } catch (e) {
        console.error('Reputation update error:', e);
    }
}

async function searchNotesHandler(req, res) {
    try {
        const { q = '', sort, course, semester, subject, college, type } = req.query;
        const query = String(q).trim();

        const filter = { isPublished: true };

        if (query) {
            const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            filter.$or = [
                { title: regex },
                { description: regex },
                { subject: regex },
                { unit: regex },
                { course: regex },
                { tags: regex },
                { 'uploadedBy.name': regex },
                { 'uploadedBy.college': regex },
                { uploaderName: regex },
                { uploaderCollege: regex },
            ];
        }
        if (course) filter.course = course;
        if (semester) filter.semester = parseInt(semester);
        if (subject) filter.subject = subject;
        if (college) filter.uploaderCollege = college;
        if (type) filter.noteType = type;

        let sortOption = { createdAt: -1 };
        if (sort === 'popular') sortOption = { downloads: -1 };
        else if (sort === 'rating') sortOption = { averageRating: -1 };
        else if (sort === 'downloads') sortOption = { downloads: -1 };
        else if (sort === 'views') sortOption = { views: -1 };

        const notes = await CommunityNote.find(filter)
            .sort(sortOption)
            .limit(50)
            .lean();
        res.json({ success: true, data: notes.map(n => ({ ...cleanId(n), source: 'community' })) });
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ success: false, message: 'Search failed' });
    }
}

async function getNoteById(req, res) {
    try {
        const { noteId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({ success: false, message: 'Invalid note ID' });
        }
        const note = await CommunityNote.findById(noteId).lean();
        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        await CommunityNote.findByIdAndUpdate(noteId, { $inc: { views: 1 } });

        if (req.user?.id) {
            await NoteView.create({ noteId, userId: req.user.id });
            await updateReputation(req.user.id, 'totalViews', 1);
        }

        res.json({ success: true, data: { ...cleanId(note), source: 'community' } });
    } catch (err) {
        console.error('GetNote error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

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

async function publishNote(req, res) {
    try {
        const { id: userId } = req.user;
        const User = require('../../models/User');
        const freshUser = await User.findById(userId).lean();
        if (!freshUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const userName = freshUser.name || '';
        const userCourse = freshUser.course || '';
        const userBranch = freshUser.branch || '';
        const userCollege = freshUser.college || '';
        const userAvatar = freshUser.avatar || '';
        const userSemester = freshUser.currentSemester || null;

        const {
            title,
            description,
            pdfUrl,
            thumbnail,
            course,
            courseId,
            semester,
            semesterId,
            subject,
            subjectId,
            unit,
            tags,
            noteType,
            playlistUrl,
        } = req.body;

        if (!title || !String(title).trim()) {
            return res.status(400).json({ success: false, message: 'Note title is required' });
        }
        if (!course || semester === undefined || !subject) {
            return res.status(400).json({ success: false, message: 'Course, semester, and subject are required' });
        }

        if (!userName || !userCourse || !userCollege || !userSemester) {
            return res.status(400).json({
                success: false,
                message: 'Please complete your academic profile before uploading notes.',
            });
        }

        let uploaderBadge = 'Beginner';
        let uploaderReputation = 0;
        try {
            const rep = await UserReputation.findOne({ userId }).lean();
            uploaderReputation = rep ? rep.points : 0;
            uploaderBadge = getBadgeForPoints(uploaderReputation);
        } catch (_) {}

        const noteData = {
            title: String(title).trim(),
            description: description || '',
            pdfUrl: pdfUrl || undefined,
            thumbnail: thumbnail || undefined,
            course: String(course).trim(),
            courseId: courseId || undefined,
            semester: parseInt(semester),
            semesterId: semesterId || undefined,
            subject: String(subject).trim(),
            subjectId: subjectId || undefined,
            unit: unit || undefined,
            tags: Array.isArray(tags) ? tags : [],
            noteType: noteType || 'pdf',
            playlistUrl: playlistUrl || undefined,
            uploadedBy: {
                id: userId,
                name: userName,
                course: userCourse,
                branch: userBranch,
                college: userCollege,
                avatar: userAvatar,
                semester: userSemester,
            },
            uploaderId: userId,
            uploaderName: userName,
            uploaderCollege: userCollege,
            uploaderCourse: userCourse,
            uploaderBranch: userBranch,
            uploaderAvatar: userAvatar,
            uploaderBadge,
            uploaderReputation,
            uploaderSemester: userSemester,
            uploadedAt: new Date(),
            isPublished: true,
            needsReview: req.body.needsReview === true,
        };

        let note;
        if (req.body.id && mongoose.Types.ObjectId.isValid(req.body.id)) {
            const existing = await CommunityNote.findById(req.body.id);
            if (existing && existing.uploadedBy.id !== userId) {
                return res.status(403).json({ success: false, message: 'You can only edit your own notes' });
            }
            note = await CommunityNote.findByIdAndUpdate(req.body.id, noteData, {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }).lean();
        } else {
            const doc = await CommunityNote.create(noteData);
            note = doc.toObject();
        }

        const subjectFilter = req.body.subjectId && mongoose.Types.ObjectId.isValid(req.body.subjectId)
            ? { _id: req.body.subjectId }
            : { name: subject };
        await Subject.updateOne(
            subjectFilter,
            { $inc: { noteCount: 1 } },
            { upsert: false }
        );

        await updateReputation(userId, 'totalUploads', 1);
        await updateReputation(userId, 'points', REPUTATION_POINTS.UPLOAD);

        try {
            await UserReputation.findOneAndUpdate(
                { userId },
                {
                    $push: {
                        activityLog: {
                            $each: [{
                                type: 'upload',
                                noteId: String(note._id),
                                noteTitle: note.title,
                                timestamp: new Date(),
                            }],
                            $slice: -100,
                        },
                    },
                },
                { upsert: true }
            );
        } catch (_) {}

        res.status(201).json({ success: true, data: cleanId(note) });
    } catch (err) {
        console.error('PublishNote error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getTrendingNotes(req, res) {
    try {
        const notes = await CommunityNote.find({ isPublished: true })
            .sort({ downloads: -1, views: -1, likes: -1 })
            .limit(20)
            .lean();
        res.json({ success: true, data: notes.map(n => ({ ...cleanId(n), source: 'community' })) });
    } catch (err) {
        console.error('Trending error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getTopRatedNotes(req, res) {
    try {
        const notes = await CommunityNote.find({ isPublished: true, ratingCount: { $gt: 0 } })
            .sort({ averageRating: -1, ratingCount: -1 })
            .limit(20)
            .lean();
        res.json({ success: true, data: notes.map(n => ({ ...cleanId(n), source: 'community' })) });
    } catch (err) {
        console.error('TopRated error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getRecentNotes(req, res) {
    try {
        const notes = await CommunityNote.find({ isPublished: true })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
        res.json({ success: true, data: notes.map(n => ({ ...cleanId(n), source: 'community' })) });
    } catch (err) {
        console.error('Recent error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getVerifiedNotes(req, res) {
    try {
        const notes = await CommunityNote.find({ isPublished: true, isVerified: true })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        res.json({ success: true, data: notes.map(n => ({ ...cleanId(n), source: 'community' })) });
    } catch (err) {
        console.error('Verified error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getNotesBySubject(req, res) {
    try {
        const { subjectName } = req.params;
        const { sort } = req.query;

        let sortOption = { createdAt: -1 };
        if (sort === 'popular') sortOption = { downloads: -1 };
        else if (sort === 'rating') sortOption = { averageRating: -1 };

        const notes = await CommunityNote.find({ subject: subjectName, isPublished: true })
            .sort(sortOption)
            .limit(50)
            .lean();
        res.json({ success: true, data: notes.map(n => ({ ...cleanId(n), source: 'community' })) });
    } catch (err) {
        console.error('SubjectNotes error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getRelatedNotes(req, res) {
    try {
        const { noteId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.json({ success: true, data: [] });
        }
        const note = await CommunityNote.findById(noteId).lean();
        if (!note) return res.json({ success: true, data: [] });

        const related = await CommunityNote.find({
            _id: { $ne: noteId },
            subject: note.subject,
            isPublished: true,
        })
            .sort({ downloads: -1 })
            .limit(6)
            .lean();
        res.json({ success: true, data: related.map(n => ({ ...cleanId(n), source: 'community' })) });
    } catch (err) {
        console.error('Related error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function rateNote(req, res) {
    try {
        const { noteId } = req.params;
        const { rating } = req.body;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({ success: false, message: 'Invalid note ID' });
        }
        const objectId = new mongoose.Types.ObjectId(noteId);

        await Rating.findOneAndUpdate(
            { noteId: objectId, userId },
            { $set: { noteId: objectId, userId, rating } },
            { upsert: true }
        );

        const stats = await Rating.aggregate([
            { $match: { noteId: objectId } },
            { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
        ]);

        const avg = stats.length > 0 ? Math.round(stats[0].avg * 10) / 10 : rating;
        const count = stats.length > 0 ? stats[0].count : 1;

        await CommunityNote.findByIdAndUpdate(noteId, {
            averageRating: avg,
            ratingCount: count,
        });

        let points = REPUTATION_POINTS.RATING_3;
        if (rating >= 5) points = REPUTATION_POINTS.RATING_5;
        else if (rating >= 4) points = REPUTATION_POINTS.RATING_4;
        await updateReputation(userId, 'points', points);

        try {
            const ratingNote = await CommunityNote.findById(noteId).lean();
            if (ratingNote?.uploadedBy?.id) {
                await UserReputation.findOneAndUpdate(
                    { userId: ratingNote.uploadedBy.id },
                    {
                        $push: {
                            activityLog: {
                                $each: [{
                                    type: 'rating',
                                    noteId: String(noteId),
                                    noteTitle: ratingNote.title,
                                    value: rating,
                                    timestamp: new Date(),
                                }],
                                $slice: -100,
                            },
                        },
                    },
                    { upsert: true }
                );
            }
        } catch (_) {}

        res.json({ success: true, data: { averageRating: avg, ratingCount: count } });
    } catch (err) {
        console.error('Rate error:', err);
        const message = err.name === 'ValidationError'
            ? 'Invalid rating data. Please try again.'
            : err.message || 'Server error';
        res.status(500).json({ success: false, message });
    }
}

async function reportNote(req, res) {
    try {
        const { noteId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({ success: false, message: 'Invalid note ID' });
        }
        const { reason, description } = req.body;
        const userId = req.user.id;

        if (!reason) {
            return res.status(400).json({ success: false, message: 'Reason is required' });
        }

        await Report.create({ noteId, reportedBy: userId, reason, description });
        await CommunityNote.findByIdAndUpdate(noteId, { $inc: { reportCount: 1 } });
        await updateReputation(userId, 'points', REPUTATION_POINTS.REPORT_PENALTY);

        res.json({ success: true, message: 'Note reported. Thank you for keeping the community safe.' });
    } catch (err) {
        console.error('Report error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function incrementDownloads(req, res) {
    try {
        const { noteId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({ success: false, message: 'Invalid note ID' });
        }
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Authentication required' });
        }
        const Download = require('../../models/Download');
        const existing = await Download.findOne({ userId, noteId });
        if (existing) {
            return res.json({ success: true, message: 'Already downloaded' });
        }
        const note = await CommunityNote.findByIdAndUpdate(noteId, { $inc: { downloads: 1 } }, { new: true }).lean();
        if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

        if (note.uploadedBy?.id) {
            await updateReputation(note.uploadedBy.id, 'totalDownloads', 1);
            await updateReputation(note.uploadedBy.id, 'points', REPUTATION_POINTS.DOWNLOAD);
            try {
                await UserReputation.findOneAndUpdate(
                    { userId: note.uploadedBy.id },
                    {
                        $push: {
                            activityLog: {
                                $each: [{
                                    type: 'download',
                                    noteId: String(note._id),
                                    noteTitle: note.title,
                                    timestamp: new Date(),
                                }],
                                $slice: -100,
                            },
                        },
                    },
                    { upsert: true }
                );
            } catch (_) {}
        }

        res.json({ success: true, data: cleanId(note) });
    } catch (err) {
        console.error('Download error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function likeNote(req, res) {
    try {
        const { noteId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({ success: false, message: 'Invalid note ID' });
        }
        const userId = req.user.id;

        const note = await CommunityNote.findById(noteId);
        if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

        note.likedBy = note.likedBy || [];
        const alreadyLiked = note.likedBy.includes(userId);

        if (alreadyLiked) {
            note.likes = Math.max((note.likes || 1) - 1, 0);
            note.likedBy = note.likedBy.filter((id) => id !== userId);
            await note.save();
            return res.json({ success: true, data: cleanId(note.toObject()), liked: false });
        }

        note.likes = (note.likes || 0) + 1;
        note.likedBy.push(userId);
        await note.save();

        if (note.uploadedBy?.id) {
            await updateReputation(note.uploadedBy.id, 'totalLikes', 1);
            try {
                await UserReputation.findOneAndUpdate(
                    { userId: note.uploadedBy.id },
                    {
                        $push: {
                            activityLog: {
                                $each: [{
                                    type: 'like',
                                    noteId: String(note._id),
                                    noteTitle: note.title,
                                    timestamp: new Date(),
                                }],
                                $slice: -100,
                            },
                        },
                    },
                    { upsert: true }
                );
            } catch (_) {}
        }
        await updateReputation(userId, 'points', REPUTATION_POINTS.LIKE);

        res.json({ success: true, data: cleanId(note.toObject()), liked: true });
    } catch (err) {
        console.error('Like error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getPopularSubjects(req, res) {
    try {
        const subjects = await Subject.find({ isActive: true })
            .sort({ noteCount: -1 })
            .limit(20)
            .lean();
        res.json({ success: true, data: subjects.map(cleanId) });
    } catch (err) {
        console.error('PopularSubjects error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getTopContributors(req, res) {
    try {
        const contributors = await UserReputation.find()
            .sort({ points: -1 })
            .limit(20)
            .lean();
        res.json({ success: true, data: contributors.map(cleanId) });
    } catch (err) {
        console.error('Contributors error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = {
    searchNotesHandler,
    getNoteById,
    getMyUploadedNotes,
    publishNote,
    getTrendingNotes,
    getTopRatedNotes,
    getRecentNotes,
    getVerifiedNotes,
    getNotesBySubject,
    getRelatedNotes,
    rateNote,
    reportNote,
    incrementDownloads,
    likeNote,
    getPopularSubjects,
    getTopContributors,
};
