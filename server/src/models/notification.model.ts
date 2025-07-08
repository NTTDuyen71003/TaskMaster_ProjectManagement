// models/notification.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { Notifications, NotificationTypeEnum } from '../enums/notification.enum';


export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; // The user who will receive the notification
  type: NotificationTypeEnum;
  title: string;
  message: string;
  data?: any; // Additional data like workspace info, remover info
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: Object.values(Notifications),
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: Schema.Types.Mixed,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const NotificationModel = mongoose.model<INotification>('Notification', notificationSchema);

export { NotificationTypeEnum };
