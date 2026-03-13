import express from "express";
import {
  getProfile,
  updateProfile,
  searchUsers,
  getFriends,
  sendFriendRequest,
  respondToFriendRequest,
  blockUser,
  unblockUser,
} from '../controllers/userController.js';

// all routes require auth

import { authMiddleware } from "../middleware/authMiddleware";
import { validateSearchUser, validateUpdateProfile } from "../middleware/validator";

const router = express.Router();

// all routes require auth
router.use(authMiddleware);

// profile 
router.get('/profile', getProfile);
router.put('/profile',validateUpdateProfile, updateProfile);

// search & friends
router.get('/search', validateSearchUser, searchUsers);
router.get('/friends', getFriends);

// friend requests
router.post('/friend-request/:userId', sendFriendRequest);
router.put('/friend-request/:requestId', respondToFriendRequest); // accept/decline

// block/unblock
router.post('/block/:userId', blockUser);
router.delete('/block/:userId', unblockUser);

export default router;