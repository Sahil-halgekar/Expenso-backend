const User = require('../models/User.model');

exports.getUserInfo = async (req, res) => {
  try {
    const userInfo = await User.findById(req.payload._id)
      .select({
        firstName: 1,
        lastName: 1,
        email: 1,
      })
      .populate('_id firstName lastName email');
    if (!userInfo) {
      return res.status(404).json({ errorMessage: 'User info not found' });
    }
    res.status(200).json({ userInfo });
  } catch (err) {
    return res.status(400).json(err);
  }
};
