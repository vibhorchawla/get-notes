const express = require('express');
const router = express.Router();
const { register, login, me } = require('./auth.controller');
const { verifyToken } = require('../../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, me);

module.exports = router;
