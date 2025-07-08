import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Loader, Search, X } from 'lucide-react';
import useWorkspaceId from '../../../hooks/use-workspace-id';
import { getProjectsInWorkspaceQueryFn } from '../../../lib/api';
import { Dialog, DialogContent } from '../../../components/ui/dialog';
import { format } from 'date-fns';
import i18n from '@/languages/i18n';
import { getDateFnsLocale } from '@/languages/getDateFnsLocale';
import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';

interface Project {
    _id: string;
    name: string;
    emoji: string;
    createdAt: string;
    createdBy: {
        name: string;
        profilePicture?: string;
    };
}

interface SearchProjectsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchProjectsDialog: React.FC<SearchProjectsDialogProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const workspaceId = useWorkspaceId();
    const { t } = useTranslation();
    const lang = i18n.language;
    const dateLocale = getDateFnsLocale();

    // Fetch all projects for search
    const { data, isLoading } = useQuery({
        queryKey: ['searchProjects', workspaceId],
        queryFn: () => getProjectsInWorkspaceQueryFn({
            workspaceId,
            pageSize: 100, // Get more projects for search
            pageNumber: 1,
        }),
        enabled: isOpen && !!workspaceId,
    });

    const projects = data?.projects || [];

    // Filter projects based on search query
    useEffect(() => {
        let newFilteredProjects: Project[];

        if (!searchQuery.trim()) {
            newFilteredProjects = projects;
        } else {
            newFilteredProjects = projects.filter((project) =>
                project.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Prevent unnecessary state update
        const isSame =
            filteredProjects.length === newFilteredProjects.length &&
            filteredProjects.every((p, i) => p._id === newFilteredProjects[i]._id);

        if (!isSame) {
            setFilteredProjects(newFilteredProjects);
            setSelectedIndex(0);
        }
    }, [searchQuery, projects]);


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
                        prev < filteredProjects.length - 1 ? prev + 1 : prev
                    );
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (filteredProjects[selectedIndex]) {
                        handleProjectSelect(filteredProjects[selectedIndex]);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onClose();
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredProjects, selectedIndex, onClose]);

    const handleProjectSelect = (project: Project) => {
        navigate(`/workspace/${workspaceId}/project/${project._id}`);
        onClose();
        setSearchQuery('');
    };

    const handleClose = () => {
        onClose();
        setSearchQuery('');
        setSelectedIndex(0);
    };

    const formatStr = lang === "vi" ? "dd'/'MM'/'yyyy" : "PPP";

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent aria-describedby={undefined} className="max-w-2xl p-0 gap-0 bg-sidebar border-gray-700">
                <DialogTitle 
                aria-describedby={undefined}
                className='sr-only'>Search Products</DialogTitle>
                <DialogDescription className='sr-only'>List Products</DialogDescription>
                {/* Search Header */}
                <div className="flex items-center border-gray-700 px-4 py-3">
                    <Search className="w-5 h-5 text-sidebar-text mr-3" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={t("navbar-search-placeholder")}
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
                    ) : filteredProjects.length === 0 ? (
                        <div className="py-8 text-center">
                            <div className="text-muted">
                                {searchQuery ?
                                    `${t("navbar-search-notfound")} "${searchQuery}"` :
                                    t("navbar-search-notfound1")
                                }
                            </div>
                        </div>
                    ) : (
                        <div className="py-2">
                            {filteredProjects.map((project, index) => (
                                <div
                                    key={project._id}
                                    className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${index === selectedIndex
                                        ? 'bg-dropdown-hover-bg text-sidebar-text'
                                        : 'hover:bg-dropdown-hover-bg text-sidebar-text'
                                        }`}
                                    onClick={() => handleProjectSelect(project)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                >
                                    <div className="flex items-center space-x-3 flex-1">
                                        <div className="w-8 h-8 rounded bg-dashboard-icon flex items-center justify-center text-lg">
                                            {project.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">
                                                {project.name}
                                            </div>
                                            <div className="text-sm text-muted">
                                                {t("navbar-search-createdby")} {project.createdBy.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted ml-4">
                                        {project.createdAt
                                            ? format(new Date(project.createdAt), formatStr, { locale: dateLocale })
                                            : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SearchProjectsDialog;
