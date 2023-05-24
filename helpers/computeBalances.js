const createError = require('http-errors');
const { default: mongoose } = require('mongoose');
const Expense = require('../models/Expense.model');
const Group = require('../models/Group.model');
const { toTwoDecimals } = require('./toTwoDecimals');

exports.computeBalances = async (groupId) => {
  const group = await Group.findById(groupId).populate('members', {
    _id: 1,
    firstName: 1,
    lastName: 1,
  });

  if (!group) {
    return null;
  }
  const owedByMember = await Expense.aggregate([
    { $match: { group: mongoose.Types.ObjectId(groupId) } },
    { $unwind: `$shares` },
    {
      $project: {
        _id: 0,
        member: '$shares.shared_with',
        shared_amount: '$shares.share_amount',
      },
    },
    {
      $group: {
        _id: '$member',
        totalOwed: { $sum: '$shared_amount' },
      },
    },
  ]);
  const paidByMember = await Expense.aggregate([
    { $match: { group: mongoose.Types.ObjectId(groupId) } },
    {
      $group: {
        _id: '$paid_by',
        totalPaid: { $sum: '$expense_amount' },
      },
    },
  ]);
  const balances = [];
  for (member of group.members) {
    const totalPaid = paidByMember.find((e) => {
      return e._id.equals(member._id);
    })?.totalPaid;

    const totalOwed = owedByMember.find((e) => {
      return e._id.equals(member._id);
    })?.totalOwed;

    balances.push({
      user: member,
      totalPaid: totalPaid || 0,
      totalOwed: totalOwed || 0,
      balance: toTwoDecimals((totalPaid || 0) - (totalOwed || 0)),
    });
  }
  return balances;
};
