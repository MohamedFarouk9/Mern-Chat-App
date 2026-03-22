import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';



const router = express.Router();

// all routes require authentication
router.use(authMiddleware);

// notification routes
router.get('/' , getNotifications);
router.put('/:notificationId/read' , markAsRead);
router.put('/read-all' , markAllAsRead);
router.delete('/:notificationId' , deleteNotification);

export default router;