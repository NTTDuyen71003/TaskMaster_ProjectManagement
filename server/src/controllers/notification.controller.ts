import { Request, Response } from 'express';
import { 
  getUserNotificationsService, 
  markNotificationAsReadService,
  getUnreadNotificationCountService 
} from '../services/notification.service';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { HTTPSTATUS } from '../config/http.config';

export const getUserNotificationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const limit = parseInt(req.query.limit as string) || 10;

    const notifications = await getUserNotificationsService(userId, limit);

    return res.status(HTTPSTATUS.OK).json({
      message: "Notifications fetched successfully",
      notifications
    });
  }
);

export const markNotificationAsReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { notificationId } = req.params;

    const notification = await markNotificationAsReadService(notificationId, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Notification marked as read",
      notification
    });
  }
);

export const getUnreadNotificationCountController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const count = await getUnreadNotificationCountService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Unread count fetched successfully",
      count
    });
  }
);
