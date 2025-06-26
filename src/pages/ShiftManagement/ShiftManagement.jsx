import { useState, useEffect } from 'react';
import { Calendar, Users, Edit, Trash2, Plus, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import api from '../../api/axiosInstance'; // Adjust path as needed
import { useNavigate } from 'react-router-dom';

// Toast Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5" />;
            case 'error':
                return <AlertCircle className="w-5 h-5" />;
            case 'info':
                return <Info className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-md ${getToastStyles()}`}>
            <div className="flex items-start gap-3">
                {getIcon()}
                <div className="flex-1">
                    <p className="font-medium">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

// Confirm Dialog Component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    if (!isOpen) return null;

    const getButtonStyles = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 text-white';
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700 text-white';
            case 'info':
                return 'bg-blue-600 hover:bg-blue-700 text-white';
            default:
                return 'bg-gray-600 hover:bg-gray-700 text-white';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-4 py-2 rounded-lg transition-colors ${getButtonStyles()}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Day Status Legend Component
const DayStatusLegend = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Day Status Legend</h3>
            <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-600">W</span>
                    </div>
                    <span className="text-sm text-gray-600">Week Off</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-blue-500">
                    </div>
                    <span className="text-sm text-gray-600">Occasional Working</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-xs text-white font-medium">D</span>
                    </div>
                    <span className="text-sm text-gray-600">Working Day</span>
                </div>
            </div>
        </div>
    );
};

const ShiftManagement = () => {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
    const navigate = useNavigate();
    const [employeeModal, setEmployeeModal] = useState({ isOpen: false, employees: [], loading: false, shiftName: '' });
    const [employeeCounts, setEmployeeCounts] = useState({});


    // Fetch assigned employees for a shift
    // Fetch assigned employees for a shift
    const fetchAssignedEmployees = async (shiftId, shiftName) => {
        try {
            setEmployeeModal({ isOpen: true, employees: [], loading: true, shiftName });

            const formData = new FormData();
            formData.append('user_id', user.user_id);
            formData.append('shift_id', shiftId);

            const response = await api.post('assign_employee_list', formData);

            if (response.data.success) {
                const employees = response.data.data || [];
                setEmployeeModal({
                    isOpen: true,
                    employees: employees,
                    loading: false,
                    shiftName
                });

                // Update the count as well
                setEmployeeCounts(prev => ({
                    ...prev,
                    [shiftId]: employees.length
                }));
            } else {
                showToast(response.data.message || 'Failed to fetch assigned employees', 'error');
                setEmployeeModal({ isOpen: false, employees: [], loading: false, shiftName: '' });
            }
        } catch (error) {
            console.error('Error fetching assigned employees:', error);
            showToast('Failed to load assigned employees. Please try again.', 'error');
            setEmployeeModal({ isOpen: false, employees: [], loading: false, shiftName: '' });
        }
    };
    // Employee Modal Component
    // Employee Modal Component
    const EmployeeModal = ({ isOpen, onClose, employees, loading, shiftName }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Assigned Employees - {shiftName}
                            </h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center h-32">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : employees.length > 0 ? (
                            <div className="max-h-64 overflow-y-auto">
                                <div className="space-y-2">
                                    {employees.map((employee, index) => (
                                        <div key={employee.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">
                                                    {employee.full_name?.charAt(0)?.toUpperCase() || 'E'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {employee.full_name || 'Unknown Employee'}
                                                </p>
                                                {employee.employee_id && (
                                                    <p className="text-sm text-gray-600">
                                                        ID: {employee.employee_id}
                                                    </p>
                                                )}
                                                {employee.cdate && (
                                                    <p className="text-sm text-gray-500">
                                                        Assigned: {employee.cdate}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">No employees assigned to this shift</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };
    // Show toast notification
    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    // Close toast
    const closeToast = () => {
        setToast(null);
    };

    // Get day color and styling based on shift_type
    const getDayStyles = (shiftType) => {
        switch (shiftType) {
            case "1":
                return 'bg-blue-500 text-white'; // Working Day - Blue background with white text
            case "2":
                return 'bg-gray-300 text-gray-600'; // Week Off - Gray background
            case "3":
                return 'bg-white border-2 border-blue-500 text-blue-500'; // Occasional - White background with blue border, no text
            default:
                return 'bg-gray-300 text-gray-600';
        }
    };

    // Check if day should show text (only for working days and week off)
    const shouldShowDayText = (shiftType) => {
        return shiftType === "1" || shiftType === "2";
    };

    // Get day status text
    const getDayStatusText = (shiftType) => {
        switch (shiftType) {
            case "1":
                return 'Working Day';
            case "2":
                return 'Week Off';
            case "3":
                return 'Occasional Working';
            default:
                return 'Week Off';
        }
    };

    // Fetch employee count for a shift
    const fetchEmployeeCount = async (shiftId) => {
        try {
            const formData = new FormData();
            formData.append('user_id', user.user_id);
            formData.append('shift_id', shiftId);

            const response = await api.post('assign_employee_list', formData);

            if (response.data.success) {
                const count = response.data.data ? response.data.data.length : 0;
                setEmployeeCounts(prev => ({
                    ...prev,
                    [shiftId]: count
                }));
            }
        } catch (error) {
            console.error('Error fetching employee count:', error);
            setEmployeeCounts(prev => ({
                ...prev,
                [shiftId]: 0
            }));
        }
    };
    // Fetch shifts from API
    const fetchShifts = async () => {
        try {
            setLoading(true);

            if (!user?.user_id) {
                return;
            }

            const formData = new FormData();
            formData.append('user_id', user.user_id);

            const response = await api.post('shift_list', formData);

            if (response.data.success) {
                const shiftsData = response.data.data || [];
                setShifts(shiftsData);

                // Fetch employee counts for each shift
                shiftsData.forEach(shift => {
                    fetchEmployeeCount(shift.shift_id);
                });
            } else {
                showToast(response.data.message || 'Failed to fetch shifts', 'error');
            }
        } catch (err) {
            console.error('Error fetching shifts:', err);
            showToast('Failed to load shifts. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, [user]);

    // Handle edit shift
    const handleEditShift = (shiftId) => {
        console.log(shiftId)
        navigate(`/add-shift?edit=${shiftId}`);
    };

    // Handle delete shift 
    const handleDeleteShift = async (shiftId, shiftName) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete Shift',
            message: `Are you sure you want to delete the shift "${shiftName}"? This action cannot be undone.`,
            confirmText: 'Delete',
            type: 'danger',
            onConfirm: async () => {
                try {
                    // Show loading state
                    setConfirmDialog({ isOpen: false });

                    const formData = new FormData();
                    formData.append('user_id', user.user_id);
                    formData.append('shift_id', shiftId);

                    const response = await api.post('shift_delete', formData);

                    if (response.data.success) {
                        showToast('Shift deleted successfully', 'success');

                        // Refresh the shifts list
                        fetchShifts();
                    } else {
                        showToast(response.data.message || 'Failed to delete shift', 'error');
                    }
                } catch (error) {
                    console.error('Error deleting shift:', error);
                    showToast('An error occurred while deleting the shift', 'error');
                }
            }
        });
    };

    // Handle assign shift
    const handleAssignShift = () => {
        navigate('/assign-shift');
    };
    // Handle create shift
    const handleCreateShift = () => {
        navigate('/add-shift');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Available Shifts ({shifts.length})
                            </h1>
                            <p className="text-gray-600">Manage your shift schedules</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleAssignShift}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <Users className="w-4 h-4" />
                            Assign Shift
                        </button>
                        <button
                            onClick={handleCreateShift}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Create Shift
                        </button>
                    </div>
                </div>

                {/* Day Status Legend */}
                <DayStatusLegend />

                {/* Shifts Table */}
                {shifts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No shifts found</h3>
                        <p className="text-gray-600 mb-4">Create your first shift to get started.</p>
                        <button
                            onClick={handleCreateShift}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Create Shift
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                            Shift Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                            Shift Days
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                            Assigned Employees
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                                            Created On
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-700">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {shifts.map((shift) => (
                                        <tr key={shift.shift_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {shift.shift_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {shift.shift_days.map((day) => (
                                                        <div key={day.day_id} className="relative group">
                                                            <span
                                                                className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium cursor-help ${getDayStyles(day.shift_type)}`}
                                                            >
                                                                {shouldShowDayText(day.shift_type) ? day.sort_name : (day.sort_name)}
                                                            </span>
                                                            {/* Tooltip */}
                                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                                {getDayStatusText(day.shift_type)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-blue-600 font-medium text-lg">
                                                        {employeeCounts[shift.shift_id] || 0}
                                                    </span>
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-600 text-sm">
                                                    {shift.created_date}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEditShift(shift.shift_id, shift.shift_name)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => fetchAssignedEmployees(shift.shift_id, shift.shift_name)}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="View Assigned Employees"
                                                    >
                                                        <Users className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteShift(shift.shift_id, shift.shift_name)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {/* Employee Modal */}
                <EmployeeModal
                    isOpen={employeeModal.isOpen}
                    onClose={() => setEmployeeModal({ isOpen: false, employees: [], loading: false, shiftName: '' })}
                    employees={employeeModal.employees}
                    loading={employeeModal.loading}
                    shiftName={employeeModal.shiftName}
                />

                {/* Toast Notification */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={closeToast}
                    />
                )}

                {/* Confirm Dialog */}
                <ConfirmDialog
                    isOpen={confirmDialog.isOpen}
                    onClose={() => setConfirmDialog({ isOpen: false })}
                    onConfirm={confirmDialog.onConfirm}
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    confirmText={confirmDialog.confirmText}
                    type={confirmDialog.type}
                />
            </div>
        </div>
    );
};

export default ShiftManagement;