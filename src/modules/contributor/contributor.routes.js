const express = require('express');
const router = express.Router();
const { getContributorProfile, getContributorNotes, getContributorActivity } = require('./contributor.controller');

router.get('/:userId/profile', getContributorProfile);
router.get('/:userId/notes', getContributorNotes);
router.get('/:userId/activity', getContributorActivity);

module.exports = router;
