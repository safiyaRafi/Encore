const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { signupSchema, loginSchema, signup, login, getMe } = require('../controllers/authController');

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getMe);

module.exports = router;
