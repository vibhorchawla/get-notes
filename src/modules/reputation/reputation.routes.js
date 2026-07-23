const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middleware/auth');
const { getMyReputation, getLeaderboard } = require('./reputation.controller');

router.get('/leaderboard', getLeaderboard);
router.get('/me', verifyToken, getMyReputation);

module.exports = router;
