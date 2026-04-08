const express = require('express');
const router = express.Router();
const { getNotesByCourse } = require('./notes.controller');

router.get('/:courseId', getNotesByCourse);

module.exports = router;
