const express = require('express');
const router = express.Router();
const { getCommunityHome, getCommunityNotesByType } = require('./community.controller');

router.get('/', getCommunityHome);
router.get('/:type', getCommunityNotesByType);

module.exports = router;
