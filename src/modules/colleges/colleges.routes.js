const express = require('express');
const router = express.Router();
const { getColleges, getCollegeNotes } = require('./colleges.controller');

router.get('/', getColleges);
router.get('/:collegeName/notes', getCollegeNotes);

module.exports = router;
