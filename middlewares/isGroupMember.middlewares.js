const createError = require('http-errors');
const Group = require('../models/Group.model');

exports.isGroupMember = async (req, res, next) => {
  const { _id: userId } = req.payload;
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ errorMessage: 'Resource not found' });
    }

    if (group?.members.includes(userId)) {
      next();
    } else {
      return res
        .status(403)
        .json({ errorMessage: 'Unauthorized access to resource' });
    }
  } catch (err) {
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};
