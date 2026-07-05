const express = require('express');
const router = express.Router();
const { register, login, me, refresh } = require('./auth.controller');
const { verifyToken } = require('../../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, me);
router.post('/refresh', verifyToken, refresh);

module.exports = router;
