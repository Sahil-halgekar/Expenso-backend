const Joi = require('joi');
const createError = require('http-errors');
const Expense = require('../models/Expense.model');
const Group = require('../models/Group.model');
const { computeBalances } = require('../helpers/computeBalances');
const { computeReimbursements } = require('../helpers/computeReimbursements');
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const { isValidId } = require('../helpers/isValidId');
const saltRounds = 12;
exports.getGroups = async (req, res) => {
  try {
    const { _id: userId } = req.payload;

    let groups = await Group.find({ members: userId })
    if (!groups) {
      return res.status(404).json({ errorMessage: 'Groups not found' });
    }
    groups = groups.map((group) => ({
      ...group._doc,
    }));

    return res.status(200).json({ groups });
  } catch (err) {
    return res.status(400).json(err);
  }
};
exports.createGroup = async (req, res) => {
  try {
    const { _id: userId } = req.payload;
    const schema = Joi.object({
      title: Joi.string().trim().required().max(50),
      category: Joi.string().trim().required(),
      currency: Joi.string().trim().required(),
    });

    const validationResult = await schema.validateAsync(req.body);

    const createdGroup = await Group.create({
      ...validationResult,
      members: [userId],
      owner: userId,
    });

    if (!createdGroup) {
      return res.status(400).json({ errorMessage: 'Group was not created' });
    }

    return res.status(201).json({ createdGroup });
  } catch (err) {
    return res.status(400).json(err.message);
  }
};
exports.deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const deletedGroup = await Group.findOneAndDelete({ _id: groupId });
    if (!deletedGroup) {
      return res.status(404).json({ errorMessage: 'Group not found' });
    } else {
      res.status(200).json({ deletedGroup });
    }
  } catch (err) {
    return res.status(400).json(err);
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId)
      .populate('members', '-password')
      .populate('owner', '-password');
    if (!group) {
      return res.status(404).json({ errorMessage: 'Group not found' });
    }

    return res.status(200).json({ group });
  } catch (err) {
    return res.status(400).json(err);
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { _id: userId } = req.payload;

    const schema = Joi.object({
      title: Joi.string().trim().max(50),
      category: Joi.string().trim(),
      members: Joi.array(),
    });
    const validationResult = await schema.validateAsync(req.body);

    const groupMembers = [];
    const currentGroup = await Group.findById(groupId);

    if (validationResult.members) {

      for (let member of validationResult.members) {
        const user = await User.findOne({ email: member.email });
        if (user) {
          groupMembers.push(user._id.toString());
        } else {
          const salt = bcrypt.genSaltSync(saltRounds);
          const hashedPassword = bcrypt.hashSync('Password1', salt);

          const tempUser = await User.create({
            firstName: member.firstName,
            lastName: member.lastName,
            email: member.email,
            password: hashedPassword,
            isTemp: true,
          });

          if (tempUser) {
            groupMembers.push(tempUser._id.toString());
          } else {
            return res.status(400).json({
              errorMessage: `An error occured while adding ${member.firstName} to the group.`,
            });
          }
        }
      }
    }

    const data = validationResult.members
      ? { ...validationResult, members: groupMembers }
      : { ...validationResult };
    const updatedGroup = await Group.findByIdAndUpdate(groupId, data, {
      new: true,
    })
      .populate('owner', '-password')
      .populate('members', '-password');

    if (!updatedGroup) {
      return res.status(400).json({
        errorMessage: `Group was not updated`,
      });
    }
    return res.status(200).json({ updatedGroup });
  } catch (err) {
    return res.status(400).json(err);
  }
};
exports.getBalances = async (req, res) => {
  try {
    const { groupId } = req.params;
    const balances = await computeBalances(groupId);
    if (!balances) {
      return res.status(404).json({ errorMessage: 'Balances not found' });
    }

    const reimbursements = computeReimbursements(balances);
    if (!reimbursements) {
      return res.status(404).json({ errorMessage: 'Reimbursements not found' });
    }

    return res.status(200).json({ balances, reimbursements });
  } catch (err) {
    return res.status(400).json(err);
  }
};


