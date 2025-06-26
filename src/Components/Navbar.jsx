// src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearPermissions } from '../redux/permissionsSlice';
const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();

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

    // Handle logout with confirmation
    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            logout();
            dispatch(clearPermissions());

        }
        setIsDropdownOpen(false);
    };

    // Get user initials for avatar
    const getUserInitials = (name) => {
        if (!name || name === 'Unknown User') return 'U';
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="fixed top-0 left-0 right-0 flex items-center justify-between w-full h-16 px-6 bg-white border-b border-gray-200 z-50 shadow-sm">
            {/* Left side - Logo/Brand */}
            <div className="flex items-center">
                <h1 className="text-xl font-bold text-gray-800">Attendance System</h1>
            </div>

            {/* Right side - User menu */}
            <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                    <Bell size={20} />
                    {/* Notification badge */}
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        {/* User Avatar */}
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      J
                        </div>

                        {/* User Name */}
                        <span className="text-gray-700 font-medium hidden sm:inline-block max-w-32 truncate">
                            Username                        </span>

                        {/* Dropdown Arrow */}
                        <ChevronDown
                            size={16}
                            className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg w-80 overflow-hidden">
                            {/* User Info Header */}
                            <div className="px-4 py-3 bg-gray-50 border-b">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {getUserInitials(user?.full_name)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            {user?.full_name || user?.name || user?.username || 'User'}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {user?.email || user?.username || user?.number || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* User Details */}
                            <div className="px-4 py-3 border-b">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Account Details</h4>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>User ID:</span>
                                        <span className="font-mono">{user?.user_id || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Username:</span>
                                        <span className="font-mono">{user?.username || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Phone:</span>
                                        <span className="font-mono">{user?.number || 'N/A'}</span>
                                    </div>
                                    {user?.email && (
                                        <div className="flex justify-between">
                                            <span>Email:</span>
                                            <span className="font-mono truncate ml-2">{user.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Menu Actions */}
                            <div className="py-2">
                                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                                    <Settings size={16} />
                                    <span>Settings</span>
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                >
                                    <LogOut size={16} />
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