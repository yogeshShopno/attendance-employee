import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Home,
    Users,
    Clock,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Star,
} from "lucide-react";

// Debounce utility to optimize resize performance
const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();

    const [expandedSubmenu, setExpandedSubmenu] = useState(null);
    const [lastActiveItem, setLastActiveItem] = useState("dashboard");

    // Menu configuration
    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
        { id: "attendance", label: "Attendance", icon: Clock, path: "/attendance" },
        {
            id: "leave",
            label: "Apply Leave",
            icon: Calendar,
            path: "/leave-application",
        },
        { id: "employees", label: "Employees", icon: Users, path: "/employee" },
    ];

    // Determine current active item
    const getActiveItemId = () => {
        for (const item of menuItems) {
            if (item.path && currentPath === item.path) return item.id;
            if (item.submenu) {
                for (const sub of item.submenu) {
                    if (currentPath === sub.path) return item.id;
                }
            }
        }
        return null;
    };

    const getActiveSubmenuPath = () => {
        for (const item of menuItems) {
            if (item.submenu) {
                for (const sub of item.submenu) {
                    if (currentPath === sub.path) return sub.path;
                }
            }
        }
        return null;
    };

    const hasActualSubmenu = (item) =>
        item.hasSubmenu && Array.isArray(item.submenu) && item.submenu.length > 0;

    const getExpandedMenuId = () => {
        for (const item of menuItems) {
            if (hasActualSubmenu(item)) {
                if (item.submenu.some((sub) => currentPath === sub.path)) {
                    return item.id;
                }
            }
        }
        return null;
    };

    const currentActiveItem = getActiveItemId();
    const activeSubmenuPath = getActiveSubmenuPath();
    const shouldExpandMenuId = getExpandedMenuId();
    const activeItem = currentActiveItem || lastActiveItem;

    // Resize listener
    const handleResize = useCallback(
        debounce(() => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setIsCollapsed(true);
            }
        }, 150),
        [setIsCollapsed]
    );

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);
    
    useEffect(() => {
        if (currentActiveItem) {
            setLastActiveItem(currentActiveItem);
        }
    }, [currentActiveItem]);

    // Expand submenu if needed
    useEffect(() => {
        if (shouldExpandMenuId && !isCollapsed) {
            setExpandedSubmenu(shouldExpandMenuId);
        }
    }, [shouldExpandMenuId, isCollapsed]);

    // Close submenu when collapsing
    useEffect(() => {
        if (isCollapsed) {
            setExpandedSubmenu(null);
        }
    }, [isCollapsed]);

    const handleMenuClick = (item) => {
        // Prevent clicks when collapsed on desktop (but allow on mobile)
        if (isCollapsed && !isMobile) {
            return;
        }

        if (hasActualSubmenu(item) && !isCollapsed) {
            setExpandedSubmenu(expandedSubmenu === item.id ? null : item.id);
            if (item.path) navigate(item.path);
        } else if (item.path) {
            navigate(item.path);
            setExpandedSubmenu(null);
            if (isMobile) setIsCollapsed(true);
        }
    };

    const getSidebarClasses = () => {
        const base =
            "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] border-r border-[var(--color-border-primary)] shadow-lg transition-all duration-300";
        
        if (isMobile) {
            return isCollapsed
                ? `${base} w-0 -translate-x-full z-30`
                : `${base} w-72 translate-x-0 z-50`;
        }
        return isCollapsed
            ? `${base} w-20 translate-x-0 z-30`
            : `${base} w-64 translate-x-0 z-30`;
    };

    return (
        <>
            {/* Mobile overlay */}
            {!isCollapsed && isMobile && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsCollapsed(true)}
                />
            )}

            {/* Mobile toggle button */}
            {isMobile && isCollapsed && (
                <button
                    onClick={() => setIsCollapsed(false)}
                    className="fixed left-0 top-1/4 transform -translate-y-1/2 z-40 w-6 h-14 bg-gradient-to-b from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] border-r border-t border-b border-[var(--color-border-primary)] rounded-tr-lg rounded-br-lg shadow-lg flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                    <ChevronRight size={18} />
                </button>
            )}

            {/* Sidebar */}
            <div className={`${getSidebarClasses()} flex flex-col`}>
                {/* Desktop toggle button */}
                {!isMobile && (
                    <div className="absolute -right-7 top-1/2 transform -translate-y-1/2 z-10">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="w-7 h-20 flex items-center justify-center bg-gradient-to-b from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] border-r border-t border-b border-[var(--color-border-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-tr-[20px] rounded-br-[20px]"
                        >
                            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                        </button>
                    </div>
                )}

                {/* Navigation */}
                <div className={`flex-1 overflow-y-auto scrollbar-thin scrollbar-track-[var(--color-scrollbar-track)] scrollbar-thumb-[var(--color-scrollbar-thumb)] ${isCollapsed && !isMobile ? 'py-6 px-2' : 'py-4'} ${(!isCollapsed || !isMobile) ? 'px-3' : ''}`}>                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeItem === item.id;
                        const isExpanded = expandedSubmenu === item.id;
                        const hasSub = hasActualSubmenu(item);

                        return (
                            <div key={item.id} className="mb-1">
                                {/* Menu item */}
                                <div
                                    onClick={() => handleMenuClick(item)}
                                    className={`transition-all duration-300 flex items-center ${
                                        isCollapsed && !isMobile 
                                            ? "justify-center py-3 mb-2 cursor-pointer hover:bg-[var(--color-bg-gradient-start)] rounded-lg" 
                                            : "px-4 py-3 cursor-pointer rounded-xl"
                                    } ${
                                        // Show active state appropriately for collapsed/expanded
                                        isActive && (!isCollapsed || isMobile)
                                            ? "bg-gradient-to-r from-[var(--color-blue)] to-[var(--color-blue-dark)] text-white shadow-lg"
                                            : isActive && isCollapsed && !isMobile
                                            ? "bg-[var(--color-blue)] text-white rounded-lg"
                                            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-gradient-start)]"
                                    }`}
                                >
                                    {isCollapsed && !isMobile ? (
                                        // Collapsed desktop view - just the icon
                                        <Icon 
                                            size={20} 
                                            className={isActive ? "text-white" : "text-[var(--color-text-secondary)]"}
                                        />
                                    ) : (
                                        // Expanded view or mobile - full layout
                                        <>
                                            <div
                                                className={`p-2 rounded-full ${
                                                    isActive && (!isCollapsed || isMobile)
                                                        ? "bg-[var(--color-bg-secondary-20)] text-white"
                                                        : "bg-[var(--color-bg-gradient-start)] text-[var(--color-text-secondary)]"
                                                }`}
                                            >
                                                <Icon size={16} />
                                            </div>
                                            {(!isCollapsed || isMobile) && (
                                                <span className="ml-3 text-sm font-medium">{item.label}</span>
                                            )}
                                            {hasSub && (!isCollapsed || isMobile) && (
                                                <ChevronRight
                                                    size={16}
                                                    className={`ml-auto transform transition-transform ${
                                                        isExpanded ? "rotate-90" : ""
                                                    }`}
                                                />
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Submenu */}
                                {hasSub && (!isCollapsed || isMobile) && (
                                    <div
                                        className="overflow-hidden transition-all duration-300"
                                        style={{
                                            maxHeight: isExpanded ? `${item.submenu.length * 40}px` : "0px",
                                        }}
                                    >
                                        {item.submenu.map((sub, idx) => (
                                            <Link
                                                key={idx}
                                                to={sub.path}
                                                onClick={() => isMobile && setIsCollapsed(true)}
                                                className={`block py-2 pl-10 text-sm ${
                                                    activeSubmenuPath === sub.path
                                                        ? "bg-[var(--color-blue-lighter)] text-[var(--color-blue-darker)]"
                                                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-blue-lightest)]"
                                                }`}
                                            >
                                                {sub.label === "Master" && <Star size={12} className="mr-2 inline" />}
                                                {sub.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default Sidebar;