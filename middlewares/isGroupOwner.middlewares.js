const Group = require('../models/Group.model');

exports.isGroupOwner = async (req, res, next) => {
  const { _id: userId } = req.payload;
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ errorMessage: 'Resource not found' });
    }
    if (userId === group.owner.toString()) {
      next();
    } else {
      return res
        .status(403)
        .json({ errorMessage: 'Only group owner can perform this request' });
    }
  } catch (err) {
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};
