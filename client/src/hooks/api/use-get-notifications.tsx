import { getUnreadNotificationCountQueryFn, getUserNotificationsQueryFn, markNotificationAsReadMutationFn } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


export const useGetUserNotifications = (limit = 100) => {
  return useQuery({
    queryKey: ['notifications', limit],
    queryFn: () => getUserNotificationsQueryFn(limit),
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};

export const useGetUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadNotificationCountQueryFn,
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsReadMutationFn,
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};




