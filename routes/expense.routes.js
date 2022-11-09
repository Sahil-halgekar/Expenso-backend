const {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpenseById,
  updateExpense,
} = require('../controllers/expense.controllers');
const { idValidation } = require('../middlewares/idValidation.middlewares');
const { isGroupMember } = require('../middlewares/isGroupMember.middlewares');

const { isAuthenticated } = require('../middlewares/jwt.middlewares');
const router = require('express').Router({ mergeParams: true });

// Route : get all expenses for a group
router.get('/', idValidation, isAuthenticated, isGroupMember, getExpenses);

// Route : create expense
router.post('/', idValidation, isAuthenticated, isGroupMember, createExpense);

// Route : delete expense
router.delete(
  '/:expenseId',
  idValidation,
  isAuthenticated,
  isGroupMember,
  deleteExpense
);

// Route : get expense by id
router.get(
  '/:expenseId',
  idValidation,
  isAuthenticated,
  isGroupMember,
  getExpenseById
);

// Route : update expense
router.patch(
  '/:expenseId',
  idValidation,
  isAuthenticated,
  isGroupMember,
  updateExpense
);

module.exports = router;
