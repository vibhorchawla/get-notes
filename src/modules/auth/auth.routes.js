const express = require('express');
const router = express.Router();
const { register, login, me, refresh, googleLogin, facebookLogin } = require('./auth.controller');
const { verifyToken } = require('../../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, me);
router.post('/refresh', verifyToken, refresh);
router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);

module.exports = router;
