const Joi = require('joi');
const createError = require('http-errors');
const Expense = require('../models/Expense.model');
const { validateExpense } = require('../helpers/validateExpense');

// Controller : get expenses for a specific group
exports.getExpenses = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const expenses = await Expense.find({ group: groupId })
      .populate('paid_by', '-password')
      .sort({ date: -1 });
    if (!expenses) {
      return res.status(404).json({ errorMessage: 'Expenses not found' });
    }
    return res.status(200).json({ expenses });

  } catch (err) {
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};

// Controller : create expense and shares
exports.createExpense = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    // Definition of validation schema
    const schema = Joi.object({
      title: Joi.string().trim().required().max(50),
      paid_by: Joi.required(),
      category: Joi.string().trim().required(),
      expense_amount: Joi.number().positive().precision(2).required(),
      shares: Joi.array().required(),
      date: Joi.date().required(),
    });

    // Get validation result
    const validationResult = await schema.validateAsync(req.body);

    // Check if total shares equals the expense amount
    const { shares, expense_amount } = validationResult;

    if (!validateExpense(expense_amount, shares)) {
      return res
        .status(403)
        .json({ errorMessage: 'Total shares must add up to expense amount' });
    }

    // Create expense
    const createdExpense = await Expense.create({
      ...validationResult,
      group: groupId,
    });

    // Return error if expense was not created
    if (!createdExpense) {
      return res.status(400).json({ errorMessage: 'Expense was not created' });
    }

    return res.status(201).json({ createdExpense });
  } catch (err) {
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};

// Controller : delete expense
exports.deleteExpense = async (req, res, next) => {
  const { expenseId } = req.params;
  try {
    const deletedExpense = await Expense.findOneAndDelete({ _id: expenseId });
    if (!deletedExpense) {
      return res.status(400).json({ errorMessage: 'Expense was not deleted' });
    }
    return res.status(200).json({ deletedExpense });
  } catch (err) {
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};

// Controller : get expense by id
exports.getExpenseById = async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const expense = await Expense.findById(expenseId)
      .populate('paid_by', '-password')
      .populate('shares.shared_with', '-password')
      .populate({
        path: 'group',
        model: 'Group',
        populate: {
          path: 'members',
          model: 'User',
          select: '-password',
        },
      });

    if (!expense) {
      return res.status(404).json({ errorMessage: 'Expense not found' });
    }

    return res.status(200).json({ expense });
  } catch (err) {
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};

// Controller : update expense
exports.updateExpense = async (req, res, next) => {
  try {
    const { expenseId } = req.params;

    const schema = Joi.object({
      title: Joi.string().trim().max(50),
      paid_by: Joi.string(),
      category: Joi.string().trim(),
      expense_amount: Joi.number().positive().precision(2),
      shares: Joi.array(),
      date: Joi.date(),
    });

    // Get validation result
    const validationResult = await schema.validateAsync(req.body);

    // Check if total shares equals the expense amount
    const { shares, expense_amount } = validationResult;
    const totalShares = shares.reduce((a, b) => a + b.share_amount, 0);
    if (totalShares !== expense_amount) {
      return res
        .status(403)
        .json({ errorMessage: 'Total shares must add up to expense amount' });
    }

    // Update expense
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        ...validationResult,
      },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(400).json({
        errorMessage: `Expense was not updated`,
      });
    }

    return res.status(200).json({ updatedExpense });
  } catch (err) {
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};
