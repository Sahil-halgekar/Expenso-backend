const Joi = require('joi');
const createError = require('http-errors');
const Expense = require('../models/Expense.model');
const Group = require('../models/Group.model');
const { computeBalances } = require('../helpers/computeBalances');
const { computeReimbursements } = require('../helpers/computeReimbursements');
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const { isValidId } = require('../helpers/isValidId');
const { default: mongoose } = require('mongoose');
const saltRounds = 12;

// Controller : get all groups where the user is a member
exports.getGroups = async (req, res, next) => {
  try {
    const { _id: userId } = req.payload;

    let groups = await Group.find({ members: userId }).populate(
      'members',
      '-password'
    );


    if (!groups) {
      return res.status(404).json({ errorMessage: 'Groups not found' });
    }
    groups = groups.map((group) => ({
      ...group._doc,
    }));

    return res.status(200).json({ groups });
  } catch (err) {
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};

// Controller : create new group
exports.createGroup = async (req, res, next) => {
  try {
    const { _id: userId } = req.payload;

    // Definition of validation schema
    const schema = Joi.object({
      title: Joi.string().trim().required().max(50),
      category: Joi.string().trim().required(),
      currency: Joi.string().trim().required(),
    });

    // Get validation result
    const validationResult = await schema.validateAsync(req.body);

    // Create group
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
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};

// Controller : delete group
exports.deleteGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const deletedGroup = await Group.findOneAndDelete({ _id: groupId });
    if (!deletedGroup) {
      return res.status(404).json({ errorMessage: 'Group not found' });
    } else {
      res.status(200).json({ deletedGroup });
    }
  } catch (err) {
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};

// Controller : get group by id
exports.getGroupById = async (req, res, next) => {
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
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};

// Controller : update group
exports.updateGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { _id: userId } = req.payload;

    // Definition of validation schema
    const schema = Joi.object({
      title: Joi.string().trim().max(50),
      category: Joi.string().trim(),
      members: Joi.array(),
    });

    // Get validation result
    const validationResult = await schema.validateAsync(req.body);

    // Validate members
    const groupMembers = [userId];
    const currentGroup = await Group.findById(groupId);

    if (validationResult.members) {
      // Create updated list of members
      // If member does not exist, create a temp user in DB
      for (let member of validationResult.members) {
        const user = await User.findOne({ email: member.email });
        if (user) {
          groupMembers.push(user._id.toString());
        } else {
          // Create temporary user
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

      const groupExpenses = await Expense.find({ group: groupId });

      // Can't remove group owner or member who was involved in at least one expense
      if (!groupMembers.includes(currentGroup.owner._id.toString())) {
        return res.status(403).json({
          errorMessage: `Can't remove the group owner from the members.`,
        });
      }

      // Return error if an involved member is removed from members
      for (let member of currentGroup.members) {
        // Perform verifications on deleted members only
        if (!groupMembers.includes(member.toString())) {
          // Expenses where deleted member was involved
          const memberExpenses = groupExpenses.filter((exp) => {
            return (
              exp.paid_by.equals(member) ||
              exp.shares.filter((share) => {
                return share.shared_with.equals(member);
              }).length !== 0
            );
          });
          // If member was involved in an expense return an error
          if (memberExpenses.length > 0) {
            return res.status(403).json({
              errorMessage: `Can't remove a member who was involved in at least one expense`,
            });
          }
        }
      }
    }

    const data = validationResult.members
      ? { ...validationResult, members: groupMembers }
      : { ...validationResult };

    // Update group
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
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};

// Controller : get group balances
exports.getBalances = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    // Get balances for all group members
    const balances = await computeBalances(groupId);
    if (!balances) {
      return res.status(404).json({ errorMessage: 'Balances not found' });
    }

    // Compute reimbursements
    const reimbursements = computeReimbursements(balances);
    if (!reimbursements) {
      return res.status(404).json({ errorMessage: 'Reimbursements not found' });
    }

    return res.status(200).json({ balances, reimbursements });
  } catch (err) {
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};


