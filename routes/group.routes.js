const {
  getGroups,
  createGroup,
  deleteGroup,
  getGroupById,
  updateGroup,
  getBalances,

} = require('../controllers/group.controllers');
const { idValidation } = require('../middlewares/idValidation.middlewares');
const { isGroupMember } = require('../middlewares/isGroupMember.middlewares');
const { isGroupOwner } = require('../middlewares/isGroupOwner.middlewares');
const { isAuthenticated } = require('../middlewares/jwt.middlewares');
const router = require('express').Router();

// Route : get all groups where the user is a member
router.get('/', isAuthenticated, getGroups);

// Route : create group
router.post('/', isAuthenticated, createGroup);

// Route : delete group
router.delete(
  '/:groupId',
  idValidation,
  isAuthenticated,
  isGroupOwner,
  deleteGroup
);

// Route : delete group
router.get(
  '/:groupId',
  idValidation,
  isAuthenticated,
  isGroupMember,
  getGroupById
);

// Route : update group
router.patch(
  '/:groupId',
  idValidation,
  isAuthenticated,
  isGroupMember,
  updateGroup
);

// Route : update group
router.get(
  '/:groupId/balances',
  idValidation,
  isAuthenticated,
  isGroupMember,
  getBalances
);
module.exports = router;
