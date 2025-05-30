import { SearchContext } from "@/context/search-projects-provider";
import { Search } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

export const useSearch = () => {
    const context = React.useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within SearchProvider');
    }
    return context;
};

// Updated Navbar Search Component (to replace your existing search form)
export const NavbarSearchForm: React.FC = () => {
    const { openSearch } = useSearch();
    const { t } = useTranslation();

    return (
        <form className="nav-link mt-2 mt-md-0 d-none d-lg-flex search">
            <div
                className="relative cursor-pointer px-3 py-2 search-border border-sidebar-border 
                flex items-center justify-center"
                onClick={openSearch}
                title={t("navbar-search-placeholder")}
            >
                <Search className="w-5 h-5 text-muted" />
            </div>
        </form>
    );
};

export const MobileSearchButton: React.FC = () => {
    const { openSearch } = useSearch();

    return (
        <button
            onClick={openSearch}
            className="nav-link count-indicator"
        >
            <Search className="w-5 h-5"style={{ color: 'hsl(var(--navbar-icon))' }} />
        </button>
    );
};