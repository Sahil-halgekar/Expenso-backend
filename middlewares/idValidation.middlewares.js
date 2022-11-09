const { isValidId } = require('../helpers/isValidId');

exports.idValidation = async (req, res, next) => {
  const { groupId, expenseId, commentId } = req.params;

  if (groupId) {
    if (!isValidId(groupId)) {
      return res
        .status(404)
        .json({ errorMessage: 'Sorry, this route does not exist' });
    }
  }

  if (expenseId) {
    if (!isValidId(expenseId)) {
      return res
        .status(404)
        .json({ errorMessage: 'Sorry, this route does not exist' });
    }
  }

  if (commentId) {
    if (!isValidId(commentId)) {
      return res
        .status(404)
        .json({ errorMessage: 'Sorry, this route does not exist' });
    }
  }

  next();
};
