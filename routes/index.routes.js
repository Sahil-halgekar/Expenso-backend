const router = require('express').Router();
const authRoutes = require('./auth.routes');
const groupRoutes = require('./group.routes');
const expenseRoutes = require('./expense.routes');
const userRoutes = require('./user.routes');
const commentRoutes = require('./comment.routes');
const { isAuthenticated } = require('../middlewares/jwt.middlewares');

// Auth routes
router.use('/auth', authRoutes);



// Group routes
router.use('/groups', groupRoutes);

// Expense routes
router.use('/groups/:groupId/expenses', expenseRoutes);

// Comment routes
router.use('/groups/:groupId/expenses/:expenseId/comments', commentRoutes);

// User routes
router.use('/userInfo', userRoutes);

module.exports = router;
