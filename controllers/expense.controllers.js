const Joi = require('joi');
const createError = require('http-errors');
const Expense = require('../models/Expense.model');
const { validateExpense } = require('../helpers/validateExpense');

exports.getExpenses = async (req, res) => {
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
    return res.status(400).json(err);
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { groupId } = req.params;
    const schema = Joi.object({
      title: Joi.string().trim().required().max(50),
      paid_by: Joi.required(),
      category: Joi.string().trim().required(),
      expense_amount: Joi.number().positive().precision(2).required(),
      shares: Joi.array().required(),
      date: Joi.date().required(),
    });

    const validationResult = await schema.validateAsync(req.body);

    const { shares, expense_amount } = validationResult;

    if (!validateExpense(expense_amount, shares)) {
      return res
        .status(403)
        .json({ errorMessage: 'Total shares must add up to expense amount' });
    }


    const createdExpense = await Expense.create({
      ...validationResult,
      group: groupId,
    });
    if (!createdExpense) {
      return res.status(400).json({ errorMessage: 'Expense was not created' });
    }

    return res.status(201).json({ createdExpense });
  } catch (err) {
    return res.status(400).json(err);
  }
};

exports.deleteExpense = async (req, res) => {
  const { expenseId } = req.params;
  try {
    const deletedExpense = await Expense.findOneAndDelete({ _id: expenseId });
    if (!deletedExpense) {
      return res.status(400).json({ errorMessage: 'Expense was not deleted' });
    }
    return res.status(200).json({ deletedExpense });
  } catch (err) {
    return res.status(400).json(err);
  }
};

exports.getExpenseById = async (req, res) => {
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
    return res.status(400).json(err);
  }
};
exports.updateExpense = async (req, res) => {
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

    const validationResult = await schema.validateAsync(req.body);
    const { shares, expense_amount } = validationResult;
    const totalShares = shares.reduce((a, b) => a + b.share_amount, 0);
    if (totalShares !== expense_amount) {
      return res
        .status(403)
        .json({ errorMessage: 'Total shares must add up to expense amount' });
    }
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
    return res.status(400).json(err);
  }
};
