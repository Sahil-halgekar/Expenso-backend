const {
  getComments,
  createComment,
  deleteComment,
} = require('../controllers/comment.controllers');

const { idValidation } = require('../middlewares/idValidation.middlewares');
const { isGroupMember } = require('../middlewares/isGroupMember.middlewares');
const { isAuthenticated } = require('../middlewares/jwt.middlewares');
const router = require('express').Router({ mergeParams: true });

router.get('/', idValidation, isAuthenticated, isGroupMember, getComments);
router.post('/', idValidation, isAuthenticated, isGroupMember, createComment);
router.delete(
  '/:commentId',
  idValidation,
  isAuthenticated,
  isGroupMember,
  deleteComment
);

module.exports = router;
