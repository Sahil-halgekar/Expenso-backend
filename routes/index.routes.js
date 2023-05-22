const router = require('express').Router();
const authRoutes = require('./auth.routes');
const groupRoutes = require('./group.routes');
const expenseRoutes = require('./expense.routes');
const userRoutes = require('./user.routes');
const { isAuthenticated } = require('../middlewares/jwt.middlewares');

// Auth routes
router.use('/auth', authRoutes);




router.use('/groups', groupRoutes);

router.use('/groups/:groupId/expenses', expenseRoutes);


router.use('/userInfo', userRoutes);

module.exports = router;
