const { getUserInfo } = require('../controllers/user.controllers');
const { isAuthenticated } = require('../middlewares/jwt.middlewares');
const router = require('express').Router();

// Route : get user info
router.get('/', isAuthenticated, getUserInfo);

module.exports = router;
