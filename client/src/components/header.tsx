import useWorkspaceId from "@/hooks/use-workspace-id";
import useCreateProjectDialog from "@/hooks/use-create-project-dialog";
import PermissionsGuard from "./resuable/permission-guard";
import { Permissions } from "@/constant/index";
import { IoLanguage } from "react-icons/io5";
import { useAuthContext } from "@/context/auth-provider";
import { Loader } from "lucide-react";
import LogoutDialog from "./asidebar/logout-dialog";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MobileSearchButton, NavbarSearchForm } from "@/hooks/use-search-projects";
import ThemeDialog from "./workspace/user/theme-selection-dialog";
import LanguageDialog from "./workspace/user/language-selection-dialog";
import { useGetUnreadNotificationCount, useGetUserNotifications, useMarkNotificationAsRead } from "@/hooks/api/use-get-notifications";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { getTimeAgo } from "@/lib/time";
import { useSearch } from "@/hooks/api/use-search-notifications";


// Define the Notification type to match usage in this file
type Notification = {
  _id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data: {
    removerName?: string;
    removerProfilePicture?: string;
    joinerName?: string;
    joinerProfilePicture?: string;
    [key: string]: any;
  };
};

const Header = () => {
  const workspaceId = useWorkspaceId();
  const { onOpen } = useCreateProjectDialog();
  const { isLoading, user } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false);
  const themeButtonRef = useRef(null);
  const [, setIsProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
  const languageButtonRef = useRef<HTMLAnchorElement>(null);
  const { data: notificationsData } = useGetUserNotifications(5);
  const { data: unreadCountData } = useGetUnreadNotificationCount();
  const { mutate: markAsRead } = useMarkNotificationAsRead();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = unreadCountData?.count || 0;
  const { openNotificationSearch } = useSearch();

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(notificationId, {
        onSuccess: () => {
          // Reload the page after marking as read
          window.location.reload();
        },
      });
    } else {
      // For already read notifications, just reload directly
      window.location.reload();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MEMBER_JOINED':
        return 'mdi-account-plus';
      case 'MEMBER_REMOVED':
        return 'mdi-account-minus';
      
      case 'WORKSPACE_NAME_CHANGED':
        return 'mdi-pencil';
      case 'WORKSPACE_DELETED':
        return 'mdi-delete';

      case 'PROJECT_CREATED':
        return 'mdi-folder-plus';
      case 'PROJECT_NAME_CHANGED':
        return 'mdi-folder-edit';
      case 'PROJECT_DELETED':
        return 'mdi-folder-remove';

      case 'TASK_ASSIGNED':
        return 'mdi-account-check';
      case 'TASK_UNASSIGNED':
        return 'mdi-account-remove';
      case 'TASK_STATUS_CHANGED':
        return 'mdi-checkbox-marked-circle-outline';
      case 'TASK_DELETED':
        return 'mdi-close-circle-outline';

      default:
        return 'mdi-bell';
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
      TASK_DELETED: 'deleterName',
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

      PROJECT_CREATED: 'creatorProfilePicture',
      PROJECT_NAME_CHANGED: 'changerProfilePicture',
      PROJECT_DELETED: 'deleterProfilePicture',

      TASK_ASSIGNED: 'assignerProfilePicture',
      TASK_UNASSIGNED: 'unassignerProfilePicture',
      TASK_STATUS_CHANGED: 'changerProfilePicture',
      TASK_DELETED: 'deleterProfilePicture',
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

  const handleToggleSidebar = () => {
    const body = document.body;
    if (body.classList.contains('sidebar-toggle-display') || body.classList.contains('sidebar-absolute')) {
      body.classList.toggle('sidebar-hidden');
    } else {
      body.classList.toggle('sidebar-icon-only');
    }
  };

  const handleToggleOffcanvas = () => {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.toggle("active");
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // Modified theme button click handler
  const handleThemeButtonClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsThemeDialogOpen(true);
  };


  const handleLanguageButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLanguageDialogOpen(true);
  };


  return (
    <nav className="navbar bg-navbar p-0 fixed-top d-flex flex-row">
      {/* mini logo */}
      <div className="navbar-brand-wrapper d-flex d-lg-none align-items-center justify-content-center">
        <a className="navbar-brand brand-logo-mini" href={`/workspace/${workspaceId}`}>
          <img src="/taskmaster.png" alt="logo" /></a>
      </div>

      {/* Icon kéo ra kéo vào */}
      <div className="navbar-menu-wrapper flex-grow d-flex align-items-stretch">
        <button
          className="navbar-toggler navbar-toggler align-self-center"
          type="button"
          onClick={handleToggleSidebar}
        >
          <span className="mdi mdi-menu"></span>
        </button>

        {/* Thanh tìm kiếm */}
        <ul className="navbar-nav w-100">
          <li className="nav-item w-100">
            <NavbarSearchForm />
          </li>
        </ul>

        {/* right header */}
        <ul className="navbar-nav navbar-nav-right">
          <li className="nav-item dropdown d-none d-lg-block">
            <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
              <button
                className="nav-link btn create-new-button 
                bg-sidebar-frameicon hover:bg-navbar-createbtn-hover bg-btn"
                id="createbuttonDropdown"
                onClick={onOpen}
                type="button"
              >
                {t("create-project-btn")}
              </button>
            </PermissionsGuard>
          </li>

          {/* Mobile icon button */}
          <li className="nav-item dropdown d-lg-none relative group">
            <PermissionsGuard requiredPermission={Permissions.CREATE_PROJECT}>
              <button
                className="nav-link btn icon-only-btn bg-sidebar-frameicon 
                hover:bg-navbar-createbtn-hover btn-cus ml-1 w-7 h-7 rounded-full flex items-center justify-center"
                onClick={onOpen}
                type="button"
              >
                <i className="mdi mdi-plus mdi-c"></i>
              </button>
            </PermissionsGuard>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded bg-sidebar text-sidebar-text text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              {t("create-project-btn")}
            </div>
          </li>

          {/* Icon 1 */}
          <li className="nav-item dropdown d-lg-none">
            <MobileSearchButton />
          </li>


          {/* Icon CHAT */}
          <li className="text-sidebar-text nav-item dropdown border-left">
            <a className="nav-link count-indicator dropdown-toggle" id="messageDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
              <i className="mdi mdi-chat" style={{ color: 'hsl(var(--navbar-icon))' }}></i>
            </a>
            <div className="bg-sidebar dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="messageDropdown">
              <h6 className="p-3 mb-0 text-sidebar-text">{t("navbar-dialog-announce")}</h6>
            </div>
          </li>

          {/* Icon anoucement */}
          <li className="text-sidebar-text nav-item dropdown border-left">
            <a
              className="nav-link count-indicator dropdown-toggle position-relative"
              id="notificationDropdown"
              href=""
              data-toggle="dropdown"
            >
              <i className="mdi mdi-bell" style={{ color: 'hsl(var(--navbar-icon))' }}></i>
              {unreadCount > 0 && (
                <span className="count bg-danger">{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </a>

            <div className="bg-sidebar dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="notificationDropdown">
              <h6 className="p-3 mb-0 text-sidebar-text">
                {t("navbar-dialog-announce-system-title")}
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-muted">({unreadCount} {t("navbar-new-notifi-title")})</span>
                )}
              </h6>
              <div className="dropdown-divider"></div>

              {isLoading ? (
                <div className="p-3 text-center">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="sr-only">{t("sidebar-loading")}</span>
                  </div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-3 text-center text-muted">
                  {t("navbar-no-notifications")}
                </div>
              ) : (
                (isMobile ? notifications.slice(0, 4) : notifications).map((notification) => {
                  const personName = getPersonName(notification);
                  const personProfilePicture = getPersonProfilePicture(notification);
                  const initials = getAvatarFallbackText(personName);
                  const avatarColor = getAvatarColor(personName);

                  return (
                    <a
                      key={notification._id}
                      className={`dropdown-item preview-item ${!notification.isRead ? 'bg-dropdown-hover-bg' : ''}`}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNotificationClick(notification._id, notification.isRead);
                      }}
                    >
                      <div className="preview-thumbnail">
                        <div className="position-relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={personProfilePicture || ""}
                              alt="Profile"
                            />
                            <AvatarFallback className={avatarColor}>
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          {/* Small icon indicator for notification type */}
                          <div
                            className="position-absolute"
                            style={{
                              bottom: '-2px',
                              right: '-2px',
                              backgroundColor: getNotificationColor(notification.type),
                              borderRadius: '50%',
                              width: '16px',
                              height: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <i
                              className={`mdi ${getNotificationIcon(notification.type)}`}
                              style={{ fontSize: '10px', color: 'white' }}
                            ></i>
                          </div>
                        </div>
                      </div>
                      <div className="preview-item-content w-full">
                        {/* Desktop layout */}
                        <div className="hidden sm:block w-[500px]">
                          <p className="preview-subject mb-1 text-sidebar-text break-words whitespace-normal !leading-snug">
                            {t(`notifications.${notification.type}.message`, notification.data)}
                            {!notification.isRead && (
                              <span className="ml-2 text-sidebar-frameicon" style={{ fontSize: '8px' }}>●</span>
                            )}
                          </p>
                          <p className="text-muted mb-0 text-xs">{getTimeAgo(notification.createdAt)}</p>
                        </div>

                        {/* Mobile layout */}
                        <div className="block sm:hidden">
                          <div className="flex flex-col space-y-1 text-sidebar-text">
                            <div className="text-sm break-words whitespace-normal leading-snug">
                              {t(`notifications.${notification.type}.message`, notification.data)}
                              {!notification.isRead && (
                                <span className="ml-2 text-sidebar-frameicon align-middle" style={{ fontSize: '8px' }}>●</span>
                              )}
                            </div>
                            <span className="text-xs text-muted">{getTimeAgo(notification.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })
              )}

              {notifications.length > 0 && (
                <>
                  <div className="dropdown-divider"></div>
                  <a
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      openNotificationSearch();
                    }}
                  >
                    <p className="p-3 mb-0 text-center text-sidebar-text">
                      {t("navbar-view-all-notifications")}
                    </p>
                  </a>
                </>
              )}
            </div>
          </li>

          {/* profile */}
          {isLoading ? (
            <Loader />
          ) : (
            <li className="nav-item dropdown">
              <a className="nav-link" id="profileDropdown" href="" data-toggle="dropdown">
                <div className="navbar-profile d-flex align-items-center">
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage src={user?.profilePicture || ""} />
                    <AvatarFallback className="text-sidebar-text rounded-full d-flex align-items-center justify-content-center font-semi-bold avatar-border">
                      {user?.name?.split(" ")?.[0]?.charAt(0)}
                      {user?.name?.split(" ")?.[1]?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="d-none d-sm-block ms-2">
                    <p className="mb-0 text-sidebar-text navbar-profile-name">{user?.name}</p>
                    <small className="text-muted">{user?.email}</small>
                  </div>
                  <i className="mdi mdi-menu-down d-none d-sm-block ms-1"></i>
                </div>
              </a>

              {/* dropdown menu */}
              <div className="bg-sidebar dropdown-menu dropdown-menu-right navbar-dropdown preview-list"
                aria-labelledby="profileDropdown">
                <h6 className="text-sidebar-text p-3 mb-0">{t("navbar-profile-title")}</h6>

                <div className="dropdown-divider"></div>
                <a className="dropdown-item preview-item">
                  <div className="preview-thumbnail">
                    {/* icon */}
                    <div className="preview-icon bg-sidebar-frameicon rounded-circle">
                      <i className="mdi mdi-settings"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="text-sidebar-text preview-subject mb-1">{t("navbar-profile-settings")}</p>
                  </div>
                </a>

                {/* Đổi theme */}
                <div className="dropdown-divider"></div>
                <a
                  ref={themeButtonRef}
                  className="dropdown-item preview-item cursor-pointer"
                  onClick={handleThemeButtonClick}
                >
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-sidebar-frameicon rounded-circle">
                      <i className="mdi mdi-brightness-4"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="text-sidebar-text preview-subject mb-1">
                      {t("navbar-change-theme")}
                    </p>
                  </div>
                </a>

                {/* Đổi ngôn ngữ */}
                <div className="dropdown-divider"></div>
                <a
                  ref={languageButtonRef}
                  className="dropdown-item preview-item cursor-pointer"
                  onClick={handleLanguageButtonClick}
                >
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-sidebar-frameicon rounded-circle">
                      <i><IoLanguage /></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="text-sidebar-text preview-subject mb-1">
                      {t("switch-language")}
                    </p>
                  </div>
                </a>

                {/* Đăng xuất */}
                <div className="dropdown-divider"></div>
                <a className="dropdown-item preview-item" onClick={() => setIsOpen(true)}>
                  <div className="preview-thumbnail">
                    <div className="preview-icon bg-sidebar-frameicon rounded-circle">
                      <i className="mdi mdi-logout"></i>
                    </div>
                  </div>
                  <div className="preview-item-content">
                    <p className="preview-subject mb-1 text-sidebar-text"
                    >{t("navbar-logout")}</p>
                  </div>
                </a>
                <LogoutDialog isOpen={isOpen} setIsOpen={setIsOpen} />

                {/* mở rộng setting */}
                <div className="dropdown-divider"></div>
                <p className="p-3 mb-0 text-center text-sidebar-text">{t("navbar-advanced-settings")}</p>
              </div>

              <ThemeDialog
                isOpen={isThemeDialogOpen}
                setIsOpen={setIsThemeDialogOpen}
                triggerRef={themeButtonRef}
                onThemeSelected={() => setIsProfileDropdownOpen(false)}
                isMobile={isMobile}
              />

              <LanguageDialog
                isOpen={isLanguageDialogOpen}
                setIsOpen={setIsLanguageDialogOpen}
                triggerRef={languageButtonRef}
                onLanguageSelected={() => setIsProfileDropdownOpen(false)}
                isMobile={isMobile}
              />
            </li>
          )}
        </ul>

        {/* nút đóng mở*/}
        <button
          className="navbar-toggler navbar-toggler-right d-lg-none align-self-center"
          type="button"
          onClick={handleToggleOffcanvas}
        >
          <span className="mdi mdi-format-line-spacing"></span>
        </button>
      </div>
    </nav>
  );
};

export default Header;
