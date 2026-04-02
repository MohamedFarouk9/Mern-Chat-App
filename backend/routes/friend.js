import express from 'express';
import {
  getPendingRequests,
  getMutualFriends,
  getSuggestedFriends,
  removeFriend,
} from '../controllers/friendController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// all routes require auth
router.use(authMiddleware);

// pending requests
router.get('/requests/pending', getPendingRequests);

// mutual friends
router.get('/mutual/:userId', getMutualFriends);

// suggestions
router.get('/suggestions', getSuggestedFriends);

// remove friend
router.delete('/:userId', removeFriend);

export default router;
