import { Search } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IoSunny, IoMoon, IoCheckmark, IoAccessibilityOutline } from 'react-icons/io5';

type ThemeDialogProps = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    triggerRef: React.RefObject<HTMLElement>;
    onThemeSelected?: () => void;
    isMobile?: boolean;
};

const ThemeDialog: React.FC<ThemeDialogProps> = ({
    isOpen,
    setIsOpen,
    triggerRef,
    onThemeSelected,
    isMobile = false
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTheme, setCurrentTheme] = useState('light');
    const dialogRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    // Expanded themes with more options
    const themes = [
        {
            id: 'light',
            name: t("navbar-theme-light"),
            icon: <IoSunny className="text-yellow-500" />,
            description: t("navbar-theme-light-desc")
        },
        {
            id: 'dark',
            name: t("navbar-theme-dark"),
            icon: <IoMoon className="text-blue-400" />,
            description: t("navbar-theme-dark-desc")
        },
        {
            // For future update
            id: 'special',
            name: t("navbar-theme-special"),
            icon: <IoAccessibilityOutline className="text-neon-green" />,
            description: t("navbar-dialog-announce"),
            disabled: true
        },
    ];

    // Filter themes based on search
    const filteredThemes = themes.filter(theme =>
        theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        theme.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Get current theme on component mount
    useEffect(() => {
        if (isOpen) {
            const currentUserId = localStorage.getItem("currentUserId");
            if (currentUserId) {
                const theme = localStorage.getItem(`theme-${currentUserId}`) || "light";
                setCurrentTheme(theme);
            }
        }
    }, [isOpen]);

    // Position dialog relative to trigger element (desktop only) - ROBUST VERSION
    useEffect(() => {
        if (isOpen && !isMobile && triggerRef.current && dialogRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const dialog = dialogRef.current;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const dialogWidth = 288; // w-72 = 288px
            const dialogHeight = 300; // Approximate height

            // Try multiple selectors to find the dropdown container
            let dropdownMenu = triggerRef.current.closest('.dropdown-menu') ||
                triggerRef.current.closest('.navbar-dropdown') ||
                triggerRef.current.closest('[class*="dropdown"]') ||
                triggerRef.current.parentElement;

            if (dropdownMenu && dropdownMenu !== document.body) {
                const dropdownRect = dropdownMenu.getBoundingClientRect();

                // Calculate positions
                let leftPosition = dropdownRect.right + 8;  // Right of dropdown
                let topPosition = dropdownRect.top;

                // Check if dialog fits on the right
                if (leftPosition + dialogWidth > viewportWidth - 16) {
                    // Try positioning to the left
                    leftPosition = dropdownRect.left - dialogWidth - 8;

                    // If still doesn't fit, position inside viewport
                    if (leftPosition < 16) {
                        leftPosition = Math.max(16, viewportWidth - dialogWidth - 16);
                    }
                }

                // Ensure dialog fits vertically
                if (topPosition + dialogHeight > viewportHeight - 16) {
                    topPosition = Math.max(16, viewportHeight - dialogHeight - 16);
                }

                dialog.style.position = 'fixed';
                dialog.style.top = `${topPosition}px`;
                dialog.style.left = `${leftPosition}px`;
                dialog.style.zIndex = '1001';

            } else {
                // Fallback: position relative to the trigger button itself
                let leftPosition = triggerRect.right + 8;
                let topPosition = triggerRect.top;

                // Adjust if going off screen
                if (leftPosition + dialogWidth > viewportWidth - 16) {
                    leftPosition = triggerRect.left - dialogWidth - 8;
                }
                if (leftPosition < 16) {
                    leftPosition = triggerRect.left;
                    topPosition = triggerRect.bottom + 8;
                }

                // Ensure vertical fit
                if (topPosition + dialogHeight > viewportHeight - 16) {
                    topPosition = triggerRect.top - dialogHeight - 8;
                }

                dialog.style.position = 'fixed';
                dialog.style.top = `${Math.max(16, topPosition)}px`;
                dialog.style.left = `${Math.max(16, leftPosition)}px`;
                dialog.style.zIndex = '1001';
            }
        }
    }, [isOpen, isMobile]);

    // Handle theme selection
    const handleThemeSelect = (themeId: string) => {
        // For future update
        const selectedTheme = themes.find(theme => theme.id === themeId);
        if (selectedTheme?.disabled) return;

        const html = document.documentElement;
        const currentUserId = localStorage.getItem("currentUserId");

        if (!currentUserId) return;

        // Remove all theme classes
        html.classList.remove('dark', 'special-theme');

        // Apply selected theme
        if (themeId === 'dark') {
            html.classList.add('dark');
        } else if (themeId === 'special') {
            html.classList.add('special-theme');
        }

        // Save to localStorage
        localStorage.setItem(`theme-${currentUserId}`, themeId);
        setCurrentTheme(themeId);

        // Close dialog and parent dropdown
        setTimeout(() => {
            setIsOpen(false);
            onThemeSelected?.();
        }, 200);
    };

    // Close on click outside or backdrop
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, setIsOpen]);

    // Handle window resize to reposition dialog - IMPROVED
    useEffect(() => {
        const handleResize = () => {
            if (isOpen && !isMobile && triggerRef.current && dialogRef.current) {
                // Re-trigger the positioning logic
                const event = new CustomEvent('repositionDialog');
                window.dispatchEvent(event);
            }
        };

        const handleRepositioning = () => {
            if (isOpen && !isMobile && triggerRef.current && dialogRef.current) {
                const dialog = dialogRef.current;
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const dialogWidth = 288;
                const dialogHeight = 300;

                let dropdownMenu = triggerRef.current.closest('.dropdown-menu') ||
                    triggerRef.current.closest('.navbar-dropdown') ||
                    triggerRef.current.closest('[class*="dropdown"]') ||
                    triggerRef.current.parentElement;

                if (dropdownMenu && dropdownMenu !== document.body) {
                    const dropdownRect = dropdownMenu.getBoundingClientRect();

                    let leftPosition = dropdownRect.right + 8;
                    let topPosition = dropdownRect.top;

                    if (leftPosition + dialogWidth > viewportWidth - 16) {
                        leftPosition = dropdownRect.left - dialogWidth - 8;
                        if (leftPosition < 16) {
                            leftPosition = Math.max(16, viewportWidth - dialogWidth - 16);
                        }
                    }

                    if (topPosition + dialogHeight > viewportHeight - 16) {
                        topPosition = Math.max(16, viewportHeight - dialogHeight - 16);
                    }

                    dialog.style.top = `${topPosition}px`;
                    dialog.style.left = `${leftPosition}px`;
                }
            }
        };

        if (isOpen && !isMobile) {
            window.addEventListener('resize', handleResize);
            window.addEventListener('repositionDialog', handleRepositioning);
            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('repositionDialog', handleRepositioning);
            };
        }
    }, [isOpen, isMobile]);

    // Handle dialog click to prevent event bubbling
    const handleDialogClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    if (!isOpen) return null;

    // Mobile Bottom Sheet Layout
    if (isMobile) {
        return (
            <>
                {/* Mobile Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
                    onClick={() => setIsOpen(false)}
                />

                {/* Mobile Bottom Sheet */}
                <div
                    ref={dialogRef}
                    className="fixed bottom-0 left-0 right-0 bg-sidebar rounded-t-xl shadow-2xl z-[9999] 
                               transform transition-transform duration-300 ease-out
                               animate-slide-up max-h-[80vh] flex flex-col"
                    onClick={handleDialogClick}
                >
                    {/* Handle Bar */}
                    <div className="flex justify-center pt-3 pb-2">
                        <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                    </div>

                    {/* Header */}
                    <div className="px-4 pb-3">
                        <h3 className="text-lg font-semibold text-sidebar-text text-center">
                            {t("navbar-theme-title-mobi")}
                        </h3>
                    </div>

                    {/* Search Bar - Mobile Optimized */}
                    <div className="px-4 pb-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder={t("navbar-theme-search")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 text-base border border-sidebar-border rounded-lg 
                                         bg-sidebar text-sidebar-text placeholder-gray-500
                                         focus:outline-none focus:border-sidebar-frameicon"
                            />
                        </div>
                    </div>

                    {/* Theme Grid - Mobile Optimized */}
                    <div className="flex-1 overflow-y-auto px-4 pb-6">
                        {filteredThemes.length === 0 ? (
                            <div className="text-center text-muted py-8">
                                {t("navbar-theme-search-notfound")}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                {filteredThemes.map((theme) => (
                                    <div
                                        key={theme.id}
                                        onClick={() => handleThemeSelect(theme.id)}
                                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all
                                                   ${currentTheme === theme.id
                                                ? 'border-sidebar-frameicon bg-dropdown-hover-bg'
                                                : 'border-sidebar-border hover:border-sidebar-border'
                                            }`}
                                    >
                                        {/* Selected Check */}
                                        {currentTheme === theme.id && (
                                            <div className="absolute top-2 right-2">
                                                <IoCheckmark className="text-sidebar-frameicon bg-white rounded-full p-1" size={20} />
                                            </div>
                                        )}

                                        {/* Theme Icon */}
                                        <div className="flex justify-center mb-3">
                                            <div className="text-3xl">
                                                {theme.icon}
                                            </div>
                                        </div>

                                        {/* Theme Info */}
                                        <div className="text-center">
                                            <div className="text-sm font-medium text-sidebar-text mb-1">
                                                {theme.name}
                                            </div>
                                            <div className="text-xs text-muted">
                                                {theme.description}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <style>
                    {`
                        @keyframes slide-up {
                            from {
                                transform: translateY(100%);
                            }
                            to {
                                transform: translateY(0);
                            }
                        }
                        .animate-slide-up {
                            animation: slide-up 0.3s ease-out;
                        }
                    `}
                </style>
            </>
        );
    }

    // Desktop Dialog Layout
    return (
        <>
            {/* Backdrop with lower z-index than dialog */}
            <div
                className="fixed inset-0 z-[1000]"
                onClick={() => setIsOpen(false)}
            />

            <div
                ref={dialogRef}
                className="bg-sidebar rounded-lg shadow-xl border border-sidebar-border w-72
                           transform transition-all duration-200 ease-out"
                style={{ position: 'fixed', zIndex: 1001 }}
                onClick={handleDialogClick}
            >
                {/* Desktop Search Bar */}
                <div className="p-3 border-b border-sidebar-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder={t("navbar-theme-search")}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-sidebar-border rounded-md 
                                     bg-sidebar text-sidebar-text placeholder-gray-500
                                     focus:outline-none focus:border-sidebar-frameicon"
                        />
                    </div>
                </div>

                {/* Desktop Theme List */}
                <div className="py-2 max-h-64 overflow-y-auto">
                    {filteredThemes.length === 0 ? (
                        <div className="px-4 py-3 text-center text-muted text-sm">
                            {t("navbar-theme-search-notfound")}
                        </div>
                    ) : (
                        filteredThemes.map((theme) => (
                            // for future update
                            <div
                                key={theme.id}
                                onClick={() => handleThemeSelect(theme.id)}
                                className={`flex items-center px-4 py-3 transition-colors 
                                        ${theme.disabled
                                        ? 'opacity-50 cursor-not-allowed'
                                        : `cursor-pointer hover:bg-dropdown-hover-bg 
                                                  ${currentTheme === theme.id ? 'bg-dropdown-hover-bg' : ''}`
                                    }`}>
                                <div className="flex-shrink-0 mr-3 w-5 h-5 flex items-center justify-center">
                                    {theme.icon}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="text-sm font-medium text-sidebar-text truncate">
                                        {theme.name}
                                    </div>
                                    <div className="text-xs text-muted truncate">
                                        {theme.description}
                                    </div>
                                </div>
                                {currentTheme === theme.id && (
                                    <div className="flex-shrink-0 ml-2">
                                        <IoCheckmark className="text-sidebar-frameicon" size={16} />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
};

export default ThemeDialog;