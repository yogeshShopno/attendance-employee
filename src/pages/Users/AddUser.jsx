import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, X, RefreshCw, CheckCircle, AlertCircle, XCircle, ArrowLeft, User, Shield } from 'lucide-react';
import api from '../../api/axiosInstance';

// Toast Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-blue-600" />;
        }
    };

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg transition-all duration-300 ${getToastStyles()}`}>
            <div className="flex items-center space-x-3">
                {getIcon()}
                <span className="font-medium">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-auto p-1 hover:bg-black hover:bg-opacity-10 rounded"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const AddUser = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const editUserId = searchParams.get('edit');
    // Check if we're editing (passed via navigation state)
    const isEditing = !!editUserId;

    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        number: '',
        email: '',
        password: '',
        user_roles_id: ''
    });

    // Component state
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [userDataLoading, setUserDataLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [errors, setErrors] = useState({});

    const showToast = (message, type) => {
        setToast({ message, type });
    };

    const closeToast = () => {
        setToast(null);
    };

    // Fetch user roles dropdown
    const fetchRoles = async () => {
        if (!user?.user_id) {
            setRolesLoading(false);
            return;
        }

        try {
            setRolesLoading(true);
            const formData = new FormData();
            formData.append('user_id', String(user.user_id));

            const res = await api.post('/user_roles_drop_down', formData);

            if (res.data?.success) {
                const rolesData = res.data.data || [];
                setRoles(rolesData);
            } else {
                showToast(res.data?.message || 'Failed to fetch roles', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Error fetching roles', 'error');
        } finally {
            setRolesLoading(false);
        }
    };

    // Fetch user data for editing
    const fetchUserData = async (userId) => {
        if (!userId || !user?.user_id) {
            return;
        }

        try {
            setUserDataLoading(true);

            const requestFormData = new FormData();
            requestFormData.append('user_id', String(user.user_id));
            requestFormData.append('edit_user_id', String(userId));

            console.log('Fetching user data for userId:', userId);

            let res;
            try {
                res = await api.post('/user_list', requestFormData);
            } catch (err) {
                console.log(err);
                throw new Error('Unable to fetch user details from any endpoint');
            }

            console.log('User data response:', res.data);

            if (res.data?.success && Array.isArray(res.data.data)) {
                // Find the user that matches the edit_user_id
                const userData = res.data.data.find(
                    (u) => String(u.edit_user_id) === String(userId)
                );

                if (!userData) {
                    showToast('User not found in response data', 'error');
                    return;
                }

                console.log('Setting form data:', userData);

                setFormData({
                    full_name: userData.full_name || userData.name || '',
                    number: userData.number || userData.phone || userData.mobile || '',
                    email: userData.email || '',
                    password: '', // Don't populate password for security
                    // Fixed: Use user_role_id from API response instead of user_roles_id
                    user_roles_id: String(userData.user_role_id || userData.user_roles_id || '')
                });
            } else {
                showToast(res.data?.message || 'Failed to fetch user data', 'error');
            }
        } catch (err) {
            console.error('Error fetching user data:', err);
            showToast(err.response?.data?.message || err.message || 'Error fetching user data', 'error');
        } finally {
            setUserDataLoading(false);
        }
    };

    // Initialize data on component mount
    useEffect(() => {
        if (user?.user_id) {
            fetchRoles();
        }
    }, [user?.user_id]);

    // Fetch user data when roles are loaded (to ensure role dropdown is populated)
    useEffect(() => {
        if (user?.user_id && isEditing && editUserId && !rolesLoading) {
            fetchUserData(editUserId);
        }
    }, [user?.user_id, isEditing, editUserId, rolesLoading]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Full name is required';
        }

        if (!formData.number.trim()) {
            newErrors.number = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.number.trim())) {
            newErrors.number = 'Phone number must be 10 digits';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!isEditing && !formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (!isEditing && formData.password.trim() && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (isEditing && formData.password.trim() && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!formData.user_roles_id) {
            newErrors.user_roles_id = 'Please select a role';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Please fix the errors in the form', 'error');
            return;
        }

        if (!user?.user_id) {
            showToast('User not authenticated', 'error');
            return;
        }

        try {
            setLoading(true);

            const submitFormData = new FormData();
            submitFormData.append('user_id', String(user.user_id));
            submitFormData.append('user_roles_id', String(formData.user_roles_id));
            submitFormData.append('full_name', formData.full_name.trim());
            submitFormData.append('number', formData.number.trim());
            submitFormData.append('email', formData.email.trim());

            if (formData.password.trim()) {
                submitFormData.append('password', formData.password);
            }

            if (isEditing) {
                submitFormData.append('edit_user_id', String(editUserId));
            }

            const res = await api.post('/user_create', submitFormData);

            if (res.data?.success) {
                showToast(
                    isEditing ? 'User updated successfully' : 'User created successfully',
                    'success'
                );

                // Navigate back after a short delay
                setTimeout(() => {
                    navigate('/usermanage');
                }, 1500);
            } else {
                showToast(res.data?.message || 'Failed to save user', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Error saving user', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel/back
    const handleCancel = () => {
        navigate('/usermanage');
    };

    // Show authentication error
    if (!user?.user_id) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Authentication Required</h2>
                    <p className="text-red-600">Please log in to manage users.</p>
                </div>
            </div>
        );
    }

    const isFormDisabled = loading || rolesLoading || userDataLoading;

    return (
        <>
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleCancel}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                            disabled={isFormDisabled}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {isEditing ? 'Edit User' : 'Create New User'}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                {isEditing ? 'Update user information and role' : 'Add a new user to the system'}
                            </p>
                            {userDataLoading && (
                                <p className="text-blue-600 text-sm mt-1 flex items-center">
                                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                    Loading user data...
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-900">User Information</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Full Name */}
                        <div>
                            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.full_name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Enter full name"
                                disabled={isFormDisabled}
                            />
                            {errors.full_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                id="number"
                                name="number"
                                value={formData.number}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.number ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Enter 10-digit phone number"
                                disabled={isFormDisabled}
                            />
                            {errors.number && (
                                <p className="mt-1 text-sm text-red-600">{errors.number}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder="Enter email address"
                                disabled={isFormDisabled}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password {!isEditing && '*'}
                                {isEditing && <span className="text-gray-500 text-xs ml-1">(Leave blank to keep current password)</span>}
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder={isEditing ? "Enter new password (optional)" : "Enter password"}
                                disabled={isFormDisabled}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label htmlFor="user_roles_id" className="block text-sm font-medium text-gray-700 mb-2">
                                User Role *
                            </label>
                            <select
                                id="user_roles_id"
                                name="user_roles_id"
                                value={formData.user_roles_id}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.user_roles_id ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                disabled={isFormDisabled}
                            >
                                <option value="">
                                    {rolesLoading ? 'Loading roles...' : 'Select a role'}
                                </option>
                                {roles.map(role => (
                                    <option key={role.user_roles_id} value={role.user_roles_id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                            {errors.user_roles_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.user_roles_id}</p>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                disabled={isFormDisabled}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                                disabled={isFormDisabled}
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        {isEditing ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        {isEditing ? 'Update User' : 'Create User'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={closeToast}
                />
            )}
        </>
    );
};

export default AddUser;