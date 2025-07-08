import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Loader, Search, X } from 'lucide-react';
import { getAllUserNotificationsQueryFn } from '../../lib/api';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { format } from 'date-fns';
import i18n from '@/languages/i18n';
import { getDateFnsLocale } from '@/languages/getDateFnsLocale';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { getAvatarColor, getAvatarFallbackText } from '@/lib/helper';
import { getTimeAgo } from '@/lib/time';


interface Notification {
    _id: string;
    userId: string;
    type:
    'MEMBER_REMOVED'
    | 'MEMBER_JOINED'
    | 'WORKSPACE_NAME_CHANGED'
    | 'WORKSPACE_DELETED'
    | 'PROJECT_NAME_CHANGED'
    | 'PROJECT_CREATED'
    | 'PROJECT_DELETED'
    | 'TASK_ASSIGNED'
    | 'TASK_UNASSIGNED'
    | 'TASK_STATUS_CHANGED'
    | 'TASK_DELETED';
    title: string;
    message: string;
    data: {
        workspaceName?: string;
        joinerName?: string;
        joinerProfilePicture?: string;
        joinerId?: string;
        removerName?: string;
        removerProfilePicture?: string;
        oldWorkspaceName?: string;
        newWorkspaceName?: string;
        changerName?: string;
        changerProfilePicture?: string;
        changerId?: string;
        ownerId?: string;
        projectName?: string;
        creatorName?: string;
        creatorProfilePicture?: string;
        creatorId?: string;
        projectId?: string;
        oldProjectName?: string;
        newProjectName?: string;
        oldProjectEmoji?: string;
        newProjectEmoji?: string;
        deleterName?: string;
        deleterProfilePicture?: string;
        deleterId?: string;
        taskId?: string;
        taskTitle?: string;
        assignerName?: string;
        assignerProfilePicture?: string;
        assignerId?: string;
        assignedName?: string;
        assignedProfilePicture?: string;
        assignedId?: string;
        unassignerName?: string;
        unassignerProfilePicture?: string;
        unassignerId?: string;
        unassignedName?: string;
        unassignedProfilePicture?: string;
        unassignedId?: string;
        oldStatus?: string;
        newStatus?: string;
        workspaceId: string;
    };
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

interface SearchNotificationsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchNotificationsDialog: React.FC<SearchNotificationsDialogProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();
    const lang = i18n.language;
    const dateLocale = getDateFnsLocale();

    // Fetch all notifications for search
    const { data, isLoading } = useQuery({
        queryKey: ['searchNotifications'],
        queryFn: getAllUserNotificationsQueryFn,
        enabled: isOpen,
    });

    const notifications = data?.notifications || [];

    // Utility functions (same as in your original code)
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'PROJECT_CREATED': return 'mdi-folder-plus';
            case 'PROJECT_NAME_CHANGED': return 'mdi-folder-edit';
            case 'WORKSPACE_NAME_CHANGED': return 'mdi-pencil';
            case 'WORKSPACE_DELETED': return 'mdi-delete';
            case 'MEMBER_REMOVED': return 'mdi-account-minus';
            case 'MEMBER_JOINED': return 'mdi-account-plus';
            case 'PROJECT_DELETED': return 'mdi-folder-remove';
            case 'TASK_ASSIGNED': return 'mdi-account-check';
            case 'TASK_UNASSIGNED': return 'mdi-account-remove';
            case 'TASK_STATUS_CHANGED': return 'mdi-checkbox-marked-circle-outline';
            case 'TASK_DELETED': return 'mdi-close-circle-outline';
            default: return 'mdi-bell';
        }
    };

    const getPersonName = (notification: Notification): string => {
        const nameFieldMap: Record<Notification['type'], keyof Notification['data']> = {
            MEMBER_JOINED: 'joinerName',
            MEMBER_REMOVED: 'removerName',
            WORKSPACE_NAME_CHANGED: 'changerName',
            WORKSPACE_DELETED: 'removerName',
            PROJECT_CREATED: 'creatorName',
            PROJECT_NAME_CHANGED: 'changerName',
            PROJECT_DELETED: 'deleterName',
            TASK_ASSIGNED: 'assignerName',
            TASK_UNASSIGNED: 'unassignerName',
            TASK_STATUS_CHANGED: 'changerName',
            TASK_DELETED:'deleterName',
        };
        const field = nameFieldMap[notification.type];
        return field ? notification.data[field] ?? 'Unknown' : 'Unknown';
    };

    const getPersonProfilePicture = (notification: Notification): string | undefined => {
        const pictureFieldMap: Record<Notification['type'], keyof Notification['data']> = {
            MEMBER_JOINED: 'joinerProfilePicture',
            MEMBER_REMOVED: 'removerProfilePicture',
            WORKSPACE_NAME_CHANGED: 'changerProfilePicture',
            WORKSPACE_DELETED: 'removerProfilePicture',
            PROJECT_NAME_CHANGED: 'changerProfilePicture',
            PROJECT_CREATED: 'creatorProfilePicture',
            PROJECT_DELETED: 'deleterProfilePicture',
            TASK_ASSIGNED: 'creatorProfilePicture',
            TASK_UNASSIGNED: 'unassignerProfilePicture',
            TASK_STATUS_CHANGED: 'changerProfilePicture',
            TASK_DELETED:'deleterProfilePicture',
        };
        const field = pictureFieldMap[notification.type];
        return field ? notification.data[field] : undefined;
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'MEMBER_JOINED':
            case 'PROJECT_CREATED':
            case 'TASK_ASSIGNED':
                return '#28a745'; // Green
            case 'WORKSPACE_NAME_CHANGED':
            case 'PROJECT_NAME_CHANGED':
            case 'TASK_STATUS_CHANGED':
                return '#007bff'; // Blue
            case 'MEMBER_REMOVED':
            case 'WORKSPACE_DELETED':
            case 'PROJECT_DELETED':
            case 'TASK_UNASSIGNED':
            case 'TASK_DELETED':
                return '#dc3545'; // Red
            default:
                return '#6c757d'; // Gray
        }
    };


    // Filter notifications based on search query
    useEffect(() => {
        let newFilteredNotifications: Notification[];

        if (!searchQuery.trim()) {
            newFilteredNotifications = notifications;
        } else {
            const query = searchQuery.toLowerCase();
            newFilteredNotifications = notifications.filter((notification) => {
                const personName = getPersonName(notification).toLowerCase();
                const notificationType = notification.type.toLowerCase();
                const workspaceName = notification.data.workspaceName?.toLowerCase() || '';
                const projectName = notification.data.projectName?.toLowerCase() || '';
                const translatedMessage = t(`notifications.${notification.type}.message`, notification.data).toLowerCase();

                return (
                    personName.includes(query) ||
                    notificationType.includes(query) ||
                    workspaceName.includes(query) ||
                    projectName.includes(query) ||
                    translatedMessage.includes(query)
                );
            });
        }

        const isSame =
            filteredNotifications.length === newFilteredNotifications.length &&
            filteredNotifications.every((n, i) => n._id === newFilteredNotifications[i]._id);

        if (!isSame) {
            setFilteredNotifications(newFilteredNotifications);
            setSelectedIndex(0);
        }
    }, [searchQuery, notifications, t]);

    // Focus input when dialog opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex(prev =>
                        prev < filteredNotifications.length - 1 ? prev + 1 : prev
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
                    break;
                case 'Enter':
                    e.preventDefault();
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredNotifications, selectedIndex, onClose]);

    const handleClose = () => {
        onClose();
        setSearchQuery('');
        setSelectedIndex(0);
    };

    const formatStr = lang === "vi" ? "dd'/'MM'/'yyyy HH:mm" : "PPP p";

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent aria-describedby={undefined} className="max-w-3xl p-0 gap-0 bg-sidebar border-gray-700">
                <DialogTitle className='sr-only'>Search Notifications</DialogTitle>
                <DialogDescription className='sr-only'>Search through all notifications</DialogDescription>

                {/* Search Header */}
                <div className="flex items-center border-gray-700 px-4 py-3">
                    <Search className="w-5 h-5 text-sidebar-text mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={t("navbar-search-notifications")}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent outline-none text-sidebar-text"
                    />
                    <button
                        onClick={handleClose}
                        className="ml-3 p-1 hover:bg-dropdown-hover-bg rounded-sm transition-colors"
                    >
                        <X className="w-4 h-4 text-sidebar-text" />
                    </button>
                </div>

                {/* Search Results */}
                <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader className="w-6 h-6 animate-spin text-muted" />
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="py-8 text-center">
                            <div className="text-muted">
                                {searchQuery
                                    ? t("navbar-search-notifications-notfound", { query: searchQuery }) || `No notifications found for "${searchQuery}"`
                                    : t("search-notifications-empty") || "No notifications found"
                                }
                            </div>
                        </div>
                    ) : (
                        <div className="py-2">
                            {filteredNotifications.map((notification, index) => {
                                const personName = getPersonName(notification);
                                const personProfilePicture = getPersonProfilePicture(notification);
                                const initials = getAvatarFallbackText(personName);
                                const avatarColor = getAvatarColor(personName);

                                return (
                                    <div
                                        key={notification._id}
                                        className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${index === selectedIndex
                                            ? 'bg-dropdown-hover-bg text-sidebar-text'
                                            : 'hover:bg-dropdown-hover-bg text-sidebar-text'
                                            }`}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        <div className="flex items-center space-x-3 flex-1">
                                            <div className="relative">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage
                                                        src={personProfilePicture || ""}
                                                        alt="Profile"
                                                    />
                                                    <AvatarFallback className={avatarColor}>
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {/* Notification type indicator */}
                                                <div
                                                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                                                    style={{ backgroundColor: getNotificationColor(notification.type) }}
                                                >
                                                    <i
                                                        className={`mdi ${getNotificationIcon(notification.type)} text-white`}
                                                        style={{ fontSize: '10px' }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center">
                                                    <span className="font-medium text-sm break-words">
                                                        {t(`notifications.${notification.type}.message`, notification.data)}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted">{getTimeAgo(notification.createdAt)}</span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted ml-4">
                                            {format(new Date(notification.createdAt), formatStr, { locale: dateLocale })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SearchNotificationsDialog;