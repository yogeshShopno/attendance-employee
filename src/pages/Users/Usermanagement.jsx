import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, RefreshCw, X, CheckCircle, AlertCircle, XCircle, User, Shield } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useSelector } from 'react-redux';

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

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    if (!isOpen) return null;

    const getButtonStyles = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 text-white';
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700 text-white';
            default:
                return 'bg-blue-600 hover:bg-blue-700 text-white';
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full sm:mx-0 sm:h-10 sm:w-10 ${type === 'danger' ? 'bg-red-100' : type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                                }`}>
                                {type === 'danger' ? (
                                    <XCircle className="h-6 w-6 text-red-600" />
                                ) : type === 'warning' ? (
                                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                                ) : (
                                    <AlertCircle className="h-6 w-6 text-blue-600" />
                                )}
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3 className="text-base font-semibold leading-6 text-gray-900">
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto transition-colors ${getButtonStyles()}`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                        <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto transition-colors"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserManagement = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', data: null });
    const permissions = useSelector(state => state.permissions);

    const showToast = (message, type) => {
        setToast({ message, type });
    };

    const closeToast = () => {
        setToast(null);
    };

    // Helper function to check if user is admin
    const isAdminUser = (userData) => {
        return userData.role_status === '1' || userData.role_status === 1 || userData.user_type === 'admin';
    };

    // Helper function to check if user can be modified
    const canModifyUser = (userData) => {
        return !isAdminUser(userData);
    };

    const fetchUsers = async () => {
        if (!user?.user_id) {
            setError('User not authenticated');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const formData = new FormData();
            formData.append('user_id', String(user.user_id));

            const res = await api.post('/user_list', formData);

            if (res.data?.success) {
                const usersData = res.data.data || [];
                setUsers(usersData);
            } else {
                const errorMsg = res.data?.message || 'Failed to fetch users';
                setError(errorMsg);
                showToast(errorMsg, 'error');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Error fetching users';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.user_id) {
            fetchUsers();
        } else {
            setLoading(false);
            setError('User not authenticated');
        }
    }, [user?.user_id]);

    const handleCreateUser = () => {
        try {
            navigate('/add-user');
        } catch (error) {
            showToast('Error navigating to create user page', error);
        }
    };

    const handleEditUser = (userData) => {
        if (!canModifyUser(userData)) {
            showToast('Admin users cannot be modified', 'warning');
            return;
        }

        setConfirmModal({
            isOpen: true,
            type: 'edit',
            data: userData
        });
    };

    const confirmEditUser = () => {
        try {
            const userData = confirmModal.data;
            navigate(`/add-user?edit=${userData.edit_user_id}`);
            console.log(userData.edit_user_id)
            setConfirmModal({ isOpen: false, type: '', data: null });
        } catch (error) {
            showToast('Error preparing user for editing', error);
            setConfirmModal({ isOpen: false, type: '', data: null });
        }
    };

    const handleDeleteUser = (userData) => {
        if (!canModifyUser(userData)) {
            showToast('Admin users cannot be deleted', 'warning');
            return;
        }

        setConfirmModal({
            isOpen: true,
            type: 'delete',
            data: userData
        });
    };

    const confirmDeleteUser = async () => {
        const userData = confirmModal.data;
        setDeleting(userData.edit_user_id);
        setConfirmModal({ isOpen: false, type: '', data: null });

        try {
            const formData = new FormData();
            formData.append('user_id', String(user.user_id));
            formData.append('edit_user_id', String(userData.edit_user_id));

            const res = await api.post('/user_delete', formData);

            if (res.data?.success) {
                await fetchUsers();
                showToast('User deleted successfully', 'success');
            } else {
                showToast(res.data?.message || 'Failed to delete user', 'error');
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Error deleting user', 'error');
        } finally {
            setDeleting(null);
        }
    };

    const handleRefresh = () => {
        fetchUsers();
        showToast('Refreshing users...', 'info');
    };

    const closeModal = () => {
        setConfirmModal({ isOpen: false, type: '', data: null });
    };

    // Show authentication error
    if (!user?.user_id && !loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Authentication Required</h2>
                    <p className="text-red-600">Please log in to manage users.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="p-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                        <p className="text-gray-600 mt-1">Manage users and their information</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleRefresh}
                            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                        {permissions['user_create'] && <button
                            onClick={handleCreateUser}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create User</span>
                        </button>}
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg font-medium text-gray-900">All Users</h3>
                    </div>

                    {loading ? (
                        <div className="px-6 py-12 text-center">
                            <div className="inline-flex items-center space-x-2 text-gray-500">
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>Loading users...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="px-6 py-12 text-center">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <p className="text-red-700 text-lg font-medium mb-2">Error Loading Users</p>
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={handleRefresh}
                                    className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Try Again</span>
                                </button>
                            </div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Plus className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-700 text-lg font-medium mb-2">No Users Found</p>
                                <p className="text-gray-500 text-sm mb-4">
                                    You haven't created any users yet. Create your first user to get started with user management.
                                </p>
                                <button
                                    onClick={handleCreateUser}
                                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Create First User</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Full Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        {permissions['user_edit','user_delete'] &&
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        }
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map(userData => (
                                        <tr key={userData.edit_user_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                <div className="flex items-center space-x-2">
                                                    {isAdminUser(userData) ? (
                                                        <Shield className="w-4 h-4 text-blue-600" />
                                                    ) : (
                                                        <User className="w-4 h-4 text-gray-500" />
                                                    )}
                                                    <span>{userData.full_name || 'Unnamed User'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {userData.email || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {userData.number || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full ${isAdminUser(userData)
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {isAdminUser(userData) ? (
                                                        <>
                                                            <Shield className="w-3 h-3 mr-1" />
                                                            Admin
                                                        </>
                                                    ) : (
                                                        <>
                                                            <User className="w-3 h-3 mr-1" />
                                                            User
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    {permissions['user_edit'] &&
                                                        <button
                                                            onClick={() => handleEditUser(userData)}
                                                            className={`p-2 rounded-md transition-colors ${canModifyUser(userData)
                                                                ? 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
                                                                : 'text-gray-400 cursor-not-allowed'
                                                                }`}
                                                            title={canModifyUser(userData) ? "Edit User" : "Admin users cannot be edited"}
                                                            disabled={deleting === userData.edit_user_id || !canModifyUser(userData)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    }
                                                    {permissions['user_delete'] &&
                                                        <button
                                                            onClick={() => handleDeleteUser(userData)}
                                                            className={`p-2 rounded-md transition-colors ${canModifyUser(userData)
                                                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50'
                                                                : 'text-gray-400 cursor-not-allowed'
                                                                }`}
                                                            title={canModifyUser(userData) ? "Delete User" : "Admin users cannot be deleted"}
                                                            disabled={deleting === userData.edit_user_id || !canModifyUser(userData)}
                                                        >
                                                            {deleting === userData.edit_user_id ? (
                                                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen && confirmModal.type === 'delete'}
                onClose={closeModal}
                onConfirm={confirmDeleteUser}
                title="Delete User"
                message={`Are you sure you want to delete "${confirmModal.data?.full_name || 'this user'}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
            />

            <ConfirmationModal
                isOpen={confirmModal.isOpen && confirmModal.type === 'edit'}
                onClose={closeModal}
                onConfirm={confirmEditUser}
                title="Edit User"
                message={`Do you want to edit the user "${confirmModal.data?.full_name || 'this user'}"?`}
                confirmText="Edit"
                cancelText="Cancel"
                type="warning"
            />
        </>
    );
};

export default UserManagement;