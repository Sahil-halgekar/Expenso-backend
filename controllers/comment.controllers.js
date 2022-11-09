const Comment = require('../models/Comment.model');
const createError = require('http-errors');
const Joi = require('joi');

// Get all the comments associated to an expense
exports.getComments = async (req, res, next) => {
  const { expenseId } = req.params;
  try {
    const comments = await Comment.find({ expense: expenseId })
      .populate('user', '-password')
      .sort({ date: -1 });

    if (!comments) {
      return res.status(404).json({ errorMessage: 'Comments not found' });
    }

    return res.status(200).json({ comments });
  } catch (err) {
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};

// Creates a new comment associated to an expense
exports.createComment = async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const { _id: userId } = req.payload;

    const commentValidationSchema = Joi.object({
      message: Joi.string().trim().max(100).required(),
    });

    const commentvalidationResult = await commentValidationSchema.validateAsync(
      req.body
    );

    const createdComment = await Comment.create({
      expense: expenseId,
      message: commentvalidationResult.message,
      user: userId,
    });

    if (!createdComment) {
      return res.status(400).json({ errorMessage: 'Comment was not created' });
    }

    await Comment.populate(createdComment, {
      path: 'user',
      select: { password: 0 },
    });

    return res.status(200).json({ createdComment });
  } catch (err) {
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};

// Controller : delete comment
exports.deleteComment = async (req, res, next) => {
  const { commentId } = req.params;
  const { _id: userId } = req.payload;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ errorMessage: 'Comment not found' });
    }

    if (userId !== comment.user.toString()) {
      return res
        .status(403)
        .json({ errorMessage: 'Only comment owner can delete a comment' });
    }

    const deletedComment = await Comment.findOneAndDelete({
      _id: commentId,
    });

    if (!deletedComment) {
      return res.status(400).json({ errorMessage: 'Comment was not deleted' });
    }
    return res.status(200).json({ deletedComment });
  } catch (err) {
    next(createError.InternalServerError(err.name + ' : ' + err.message));
  }
};
