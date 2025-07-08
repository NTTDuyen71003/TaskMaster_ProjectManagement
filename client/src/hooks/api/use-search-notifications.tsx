import { SearchContext } from "@/context/search-notifications-provider";
import React from "react";

export const useSearch = () => {
    const context = React.useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within SearchProvider');
    }
    return context;
};