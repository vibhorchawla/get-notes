const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const originalName = file.originalname || 'upload.bin';
        const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${uuidv4()}-${safeName}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 },
});

function handleUpload(req, res, next) {
    upload.single('file')(req, res, (err) => {
        if (err) {
            const message =
                err.code === 'LIMIT_FILE_SIZE'
                    ? 'File is too large (max 25 MB).'
                    : err.message || 'Upload failed';
            return res.status(400).json({ success: false, message });
        }
        next();
    });
}

function uploadFile(req, res) {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file received. Try picking the file again.',
        });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const url = `${protocol}://${host}/api/files/${req.file.filename}`;

    res.status(201).json({
        success: true,
        data: {
            url,
            name: req.file.originalname || req.file.filename,
            filename: req.file.filename,
        },
    });
}

function serveFile(req, res) {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found' });
    }

    res.sendFile(filePath);
}

module.exports = { handleUpload, uploadFile, serveFile };
