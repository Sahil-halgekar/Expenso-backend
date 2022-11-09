const createError = require('http-errors');
const { default: mongoose } = require('mongoose');
const { Schema, model } = require('mongoose');
const Comment = require('./Comment.model');

const expenseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'Restaurants/Bars',
        'Rent/Charges',
        'Groceries',
        'Shopping',
        'Accommodation',
        'Entertainment',
        'Transport',
        'Pets',
        'Other',
      ],
      default: 'Other',
    },
    paid_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    expense_amount: {
      type: Number,
      min: 0,
      required: true,
    },
    date: { type: Schema.Types.Date, default: new Date(), required: true },
    shares: [
      {
        _id: false,
        shared_with: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        share_amount: { type: Number, min: 0, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

expenseSchema.pre('findOneAndDelete', async function (next) {
  try {
    const expenseId = this.getQuery()['_id'];
    await Comment.deleteMany({ expense: expenseId });
    next();
  } catch (err) {
    next(
      createError.InternalServerError(
        'Error in deleting comment related to the expense'
      )
    );
  }
});

const Expense = model('Expense', expenseSchema);

module.exports = Expense;
