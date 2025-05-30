// routes/notification.routes.ts
import { Router } from 'express';
import {
  getUserNotificationsController,
  markNotificationAsReadController,
  getUnreadNotificationCountController
} from '../controllers/notification.controller';


const notificationRoutes = Router();

// Get user notifications
notificationRoutes.get('/', getUserNotificationsController);

// Get unread notification count
notificationRoutes.get('/unread-count', getUnreadNotificationCountController);

// Mark notification as read
notificationRoutes.patch('/:notificationId/read', markNotificationAsReadController);

export default notificationRoutes;