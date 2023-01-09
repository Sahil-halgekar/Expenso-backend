const { Schema, model } = require('mongoose');
const createError = require('http-errors');
const User = require('./User.model');
const Expense = require('./Expense.model');
const Comment = require('./Comment.model');
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

groupSchema.pre('save', async function (next) {
  try {
    this.joinLink = `${process.env.ORIGIN}/join/${this._id.toString()}`;
  } catch (err) {
    next(createError.BadRequest('JoinLink was not created'));
  }
});
// Make group members as friends
groupSchema.pre('findOneAndUpdate', async function (doc, next) {
  try {
    const { members } = this.getUpdate();
    if (members) {
      for (let member of members) {
        const newFriends = members.filter((m) => {
          return m !== member;
        });

        await User.findByIdAndUpdate(member, {
          $addToSet: { friends: newFriends },
        });
      }
    }
  } catch (err) {
    console.log(err);
    next(createError.InternalServerError('Error in updating users friends'));
  }
});
const Group = model('Group', groupSchema);

module.exports = Group;
