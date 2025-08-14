import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User, LogOut, Settings, Calendar, Clock } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../context/Themetoggle';

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const { user, logout, isAuthenticated } = useAuth();

    // Extract user data from employee_data structure
    const employee = user?.employee_data || user;
    const userName = employee?.full_name || employee?.name || 'User';
    const userPhone = employee?.number || employee?.phone || '';

    // Update date and time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle logout
    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error('Logout error:', error);
            // Force navigation even if logout fails
            navigate("/");
        }
    };

    // Get user initials for avatar
    const getUserInitials = (name) => {
        if (!name || name === 'Unknown User') return 'U';
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    // Format date and time
    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getDayOfWeek = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    // Don't render navbar if user is not authenticated
    if (!isAuthenticated()) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 flex items-center justify-between w-full h-16 px-4 md:px-6 bg-gradient-to-r from-[var(--color-bg-secondary)] to-[var(--color-bg-gradient-end)] border-b border-[var(--color-border-primary)] z-50 shadow-lg backdrop-blur-sm">
            {/* Left side - Logo/Brand */}
            <div className="flex items-center">
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-[var(--color-blue)] to-[var(--color-blue-dark)] bg-clip-text text-transparent">
                    Attendance System
                </h1>
            </div>

            {/* Right side - All controls moved here */}
            <div className="flex items-center space-x-2 md:space-x-4">
                {/* Theme Toggle */}
                <div className="hidden sm:block">
                    <ThemeToggle />
                </div>

                {/* Date and Time - Now on right side */}
                <div className="hidden md:flex items-center space-x-3 bg-[var(--color-bg-gradient-start)] rounded-lg px-3 py-2  backdrop-blur-sm">
                    <div className="flex items-center space-x-2 text-[var(--color-text-secondary)]">
                        <Calendar size={14} className="text-[var(--color-blue)]" />
                        <span className="text-xs font-medium">
                            {formatDate(currentDateTime)}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[var(--color-text-secondary)]">
                        <span className="text-xs font-medium">
                            {getDayOfWeek(currentDateTime)}
                        </span>
                    </div>
                    <div className="w-px h-4 bg-[var(--color-border-primary)]"></div>
                    <div className="flex items-center space-x-2 text-[var(--color-text-secondary)]">
                        <Clock size={14} className="text-[var(--color-blue)]" />
                        <span className="text-xs font-medium font-mono">
                            {formatTime(currentDateTime)}
                        </span>
                    </div>
                </div>

                {/* Notifications */} {/* Notification badge */}
                    
                {/* <button className="relative p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-gradient-start)] rounded-lg transition-all duration-200 hover:shadow-md group">
                    <Bell size={18} className="group-hover:animate-pulse" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-[var(--color-error)] to-[var(--color-error-light)] rounded-full animate-pulse"></span>
                </button> */}

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[var(--color-bg-gradient-start)] transition-all duration-200 hover:shadow-md group"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        {/* User Avatar */}
                        <div className="w-8 h-8 bg-gradient-to-r from-[var(--color-blue)] to-[var(--color-blue-dark)] rounded-full flex items-center justify-center text-[var(--color-text-white)] text-sm font-semibold shadow-md hover:shadow-lg transition-shadow duration-200">
                            {getUserInitials(userName)}
                        </div>

                        {/* User Name - Hidden on small screens */}
                        <span className="text-[var(--color-text-secondary)] font-medium hidden md:inline-block max-w-32 truncate group-hover:text-[var(--color-text-primary)] transition-colors duration-200">
                            {userName}
                        </span>

                        {/* Dropdown Arrow */}
                        <ChevronDown
                            size={16}
                            className={`text-[var(--color-text-secondary)] transition-all duration-300 group-hover:text-[var(--color-text-primary)] ${isDropdownOpen ? 'rotate-180' : 'rotate-0'
                                }`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-12 bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] rounded-xl shadow-xl w-80 overflow-hidden backdrop-blur-sm animate-in slide-in-from-top-2 duration-200">
                            {/* User Info Header */}
                            <div className="px-4 py-4 bg-gradient-to-r from-[var(--color-bg-primary)] to-[var(--color-bg-gradient-start)] border-b border-[var(--color-border-primary)]">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-[var(--color-blue)] to-[var(--color-blue-dark)] rounded-full flex items-center justify-center text-[var(--color-text-white)] font-bold text-lg shadow-lg">
                                        {getUserInitials(userName)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                                            {userName}
                                        </h3>
                                        <p className="text-sm text-[var(--color-text-secondary)] truncate">
                                            {userPhone || 'No phone number'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Date/Time Info for Mobile */}
                            <div className="md:hidden px-4 py-3 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-gradient-start)]">
                                <h4 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2 flex items-center">
                                    <Clock size={14} className="mr-2" />
                                    Current Status
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--color-text-secondary)]">Date:</span>
                                        <span className="font-medium text-[var(--color-text-primary)]">
                                            {formatDate(currentDateTime)} {getDayOfWeek(currentDateTime)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[var(--color-text-secondary)]">Time:</span>
                                        <span className="font-mono font-medium text-[var(--color-text-primary)]">
                                            {formatTime(currentDateTime)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Theme Toggle for Mobile */}
                            <div className="sm:hidden px-4 py-3 border-b border-[var(--color-border-primary)]">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-[var(--color-text-primary)]">Theme</span>
                                    <ThemeToggle />
                                </div>
                            </div>

                            {/* Menu Actions */}
                            <div className="py-2">
                                <button className="w-full px-4 py-3 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-gradient-start)] hover:text-[var(--color-text-primary)] flex items-center space-x-3 transition-all duration-200 group">
                                    <div className="p-1 rounded-md bg-[var(--color-bg-gradient-start)] group-hover:bg-[var(--color-blue-lighter)] transition-colors duration-200">
                                        <Settings size={14} className="group-hover:text-[var(--color-blue-dark)]" />
                                    </div>
                                    <span>Settings</span>
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-3 text-left text-sm text-[var(--color-error)] hover:bg-[var(--color-error-light)] hover:text-[var(--color-error-dark)] flex items-center space-x-3 transition-all duration-200 group"
                                >
                                    <div className="p-1 rounded-md bg-[var(--color-error-light)] group-hover:bg-[var(--color-error)] transition-colors duration-200">
                                        <LogOut size={14} className="group-hover:text-[var(--color-text-white)]" />
                                    </div>
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;