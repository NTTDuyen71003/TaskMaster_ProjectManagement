import React, { useEffect, useState } from "react";
import SearchProjectsDialog from "../components/workspace/project/search-projects-dialog";
import SearchNotificationsDialog from "@/components/notifications/search-notifications-dialog";


interface SearchContextType {
  isProjectSearchOpen: boolean;
  isNotificationSearchOpen: boolean;
  openProjectSearch: () => void;
  closeProjectSearch: () => void;
  openNotificationSearch: () => void;
  closeNotificationSearch: () => void;
}

export const SearchContext = React.createContext<SearchContextType>({
  isProjectSearchOpen: false,
  isNotificationSearchOpen: false,
  openProjectSearch: () => {},
  closeProjectSearch: () => {},
  openNotificationSearch: () => {},
  closeNotificationSearch: () => {},
});

export const SearchNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isProjectSearchOpen, setIsProjectSearchOpen] = useState(false);
  const [isNotificationSearchOpen, setIsNotificationSearchOpen] = useState(false);

  const openProjectSearch = () => setIsProjectSearchOpen(true);
  const closeProjectSearch = () => setIsProjectSearchOpen(false);
  const openNotificationSearch = () => setIsNotificationSearchOpen(true);
  const closeNotificationSearch = () => setIsNotificationSearchOpen(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openProjectSearch();
      }
      // Add shortcut for notifications (Ctrl/Cmd + Shift + N)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        openNotificationSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <SearchContext.Provider value={{ 
      isProjectSearchOpen, 
      isNotificationSearchOpen,
      openProjectSearch, 
      closeProjectSearch,
      openNotificationSearch,
      closeNotificationSearch
    }}>
      {children}
      <SearchProjectsDialog isOpen={isProjectSearchOpen} onClose={closeProjectSearch} />
      <SearchNotificationsDialog isOpen={isNotificationSearchOpen} onClose={closeNotificationSearch} />
    </SearchContext.Provider>
  );
};