const { Schema, model } = require('mongoose');
const createError = require('http-errors');
const User = require('./User.model');
const Expense = require('./Expense.model');

const { currency_codes } = require('../helpers/currencies');
require('dotenv/config');

const groupSchema = new Schema({
  title: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['Event', 'Trip', 'Couple', 'Project', 'Other'],
    default: 'Other',
    required: true,
  },
  currency: {
    type: String,
    enum: currency_codes,
    default: 'EUR',
    required: true,
  },
  members: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    required: true,
  },
});





const Group = model('Group', groupSchema);

module.exports = Group;
