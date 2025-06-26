import React, { useEffect, useState } from 'react';
import api from '../../api/axiosInstance'; // Adjust the import path as needed
// MUI Icons
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
// Additional icons for toast (you can replace with your preferred icon library)
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

// Toast Component
const Toast = ({ message, type, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getToastStyles = () => {
        const baseStyles = "transform transition-all duration-300 ease-out";
        const visibilityStyles = isVisible
            ? "translate-x-0 opacity-100 scale-100"
            : "translate-x-full opacity-0 scale-95";

        switch (type) {
            case 'success':
                return `${baseStyles} ${visibilityStyles} bg-white border border-emerald-200 text-emerald-800 shadow-lg`;
            case 'error':
                return `${baseStyles} ${visibilityStyles} bg-white border border-red-200 text-red-800 shadow-lg`;
            case 'info':
                return `${baseStyles} ${visibilityStyles} bg-white border border-blue-200 text-blue-800 shadow-lg`;
            case 'warning':
                return `${baseStyles} ${visibilityStyles} bg-white border border-yellow-200 text-yellow-800 shadow-lg`;
            default:
                return `${baseStyles} ${visibilityStyles} bg-white border border-gray-200 text-gray-800 shadow-lg`;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'info':
                return <Info className="w-5 h-5 text-blue-500" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default:
                return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-lg max-w-md ${getToastStyles()}`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{message}</p>
                </div>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const LeaveStatusPage = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('1'); // '1' for Pending
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [viewDialogData, setViewDialogData] = useState(null);
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    // Status mappings
    const statusMapping = {
        0: { value: '1', name: 'Pending', displayName: 'Pending' },
        1: { value: '2', name: 'Approved', displayName: 'Approved' },
        2: { value: '3', name: 'Rejected', displayName: 'Rejected' }
    };

    const getStatusByValue = (statusValue) => {
        const entry = Object.values(statusMapping).find(status => status.value === statusValue);
        return entry ? entry.displayName : 'Unknown';
    };

    // Show toast function
    const showToast = (message, type = 'success') => {
        setToast({
            show: true,
            message,
            type
        });
    };

    // Hide toast function
    const hideToast = () => {
        setToast(prev => ({ ...prev, show: false }));
    };

    // Data fetching
    const fetchLeaveRequests = async (status = selectedStatus) => {
        if (!user?.user_id) {
            console.error('User ID not available');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('user_id', user.user_id);
            formData.append('status', status);

            const response = await api.post('/leave_list', formData);

            if (response.data.success) {
                setLeaveRequests(response.data.data || []);
            } else {
                console.error('Failed to fetch leave requests:', response.data.message);
                showToast(response.data.message || 'Failed to fetch leave requests', 'error');
            }
        } catch (error) {
            console.error("Error fetching leave requests:", error);
            showToast('Failed to fetch leave requests. Please try again.', 'error');
        }
    };

    useEffect(() => {
        if (user?.user_id) {
            fetchLeaveRequests();
        }
    }, [user, selectedStatus]);

    // Filter leave requests whenever the data changes
    useEffect(() => {
        setFilteredRequests(leaveRequests);
    }, [leaveRequests]);

    // Handle tab change
    const handleTabChange = (status, tabIndex) => {
        setTabValue(tabIndex);
        setSelectedStatus(status);
    };

    // Handle view function
    const handleView = (leave) => {
        setViewDialogData({
            ...leave,
            totalDays: leave.total_days
        });
        setViewDialogOpen(true);
    };

    // Close view dialog
    const handleCloseViewDialog = () => {
        setViewDialogOpen(false);
    };

    // Handle approve function
    const handleApprove = async (leaveId) => {
        if (!user?.user_id) {
            showToast('User authentication required', 'error');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('user_id', user.user_id);
            formData.append('status', '2'); // Approved
            formData.append('leave_id', leaveId);
            formData.append('reject_reason', '');

            const response = await api.post('/change_leave_status', formData);

            if (response.data.success) {
                showToast('Leave request approved successfully!', 'success');
                // Refresh the current tab data
                fetchLeaveRequests();
            } else {
                showToast(response.data.message || 'Failed to approve leave request', 'error');
            }
        } catch (error) {
            console.error("Error approving leave request:", error);
            showToast('Failed to approve leave request. Please try again.', 'error');
        }
    };

    // Handle reject function
    const handleReject = (leave) => {
        setSelectedLeave(leave);
    };

    // Submit rejection function
    const submitRejection = async () => {
        if (!user?.user_id) {
            showToast('User authentication required', 'error');
            return;
        }

        if (!rejectionReason.trim()) {
            showToast('Please provide a reason for rejection.', 'warning');
            return;
        }

        if (!selectedLeave || !selectedLeave.leave_id) {
            showToast('Something went wrong. Please try again.', 'error');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('user_id', user.user_id);
            formData.append('status', '3'); // Rejected
            formData.append('leave_id', selectedLeave.leave_id);
            formData.append('reject_reason', rejectionReason);

            const response = await api.post('/change_leave_status', formData);

            if (response.data.success) {
                showToast('Leave request rejected successfully!', 'success');
                setRejectionReason('');
                setSelectedLeave(null);
                // Refresh the current tab data
                fetchLeaveRequests();
            } else {
                showToast(response.data.message || 'Failed to reject leave request', 'error');
            }
        } catch (error) {
            console.error("Error rejecting leave request:", error);
            showToast('Failed to reject leave request. Please try again.', 'error');
        }
    };

    // Helper function to get status chip
    const getStatusChip = (statusValue) => {
        const status = getStatusByValue(statusValue);
        switch (status) {
            case 'Pending':
                return (
                    <div className="flex items-center bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-sm">
                        <AccessTimeIcon className="h-4 w-4 mr-1" />
                        <span>Pending</span>
                    </div>
                );
            case 'Approved':
                return (
                    <div className="flex items-center bg-green-100 text-green-600 px-2 py-1 rounded-full text-sm">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        <span>Approved</span>
                    </div>
                );
            case 'Rejected':
                return (
                    <div className="flex items-center bg-red-100 text-red-600 px-2 py-1 rounded-full text-sm">
                        <CancelIcon className="h-4 w-4 mr-1" />
                        <span>Rejected</span>
                    </div>
                );
            default:
                return null;
        }
    };

    // Parse date from DD-MM-YYYY format
    const parseDate = (dateString) => {
        const [day, month, year] = dateString.split('-');
        return new Date(year, month - 1, day);
    };

    // Format date for display
    const formatDate = (dateString) => {
        try {
            const date = parseDate(dateString);
            return date.toLocaleDateString('en-GB');
        } catch (error) {
            console.log(error)
            return dateString; // Return original if parsing fails
        }
    };

    // Render leave card - consistent across all statuses
    const renderLeaveCard = (leave) => (
        <div className="w-full md:w-1/3 px-3 mb-6" key={leave.leave_id}>
            <div className="bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col">
                <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-2/3">
                            <h2 className="text-lg font-medium text-gray-800 truncate">{leave.full_name}</h2>
                            <p className="text-sm text-gray-500">{leave.leave_type}</p>
                        </div>
                        {getStatusChip(leave.status)}
                    </div>

                    <hr className="my-4" />

                    <div className="mb-4">
                        <div className="flex items-center mb-2">
                            <CalendarTodayIcon className="h-4 w-4 mr-2 text-gray-500" />
                            <p className="text-sm">
                                <span className="font-medium">Start:</span> {formatDate(leave.start_date)}
                            </p>
                        </div>
                        <div className="flex items-center mb-2">
                            <CalendarTodayIcon className="h-4 w-4 mr-2 text-gray-500" />
                            <p className="text-sm">
                                <span className="font-medium">End:</span> {formatDate(leave.end_date)}
                            </p>
                        </div>
                        <div className="flex items-center mb-2">
                            <AccessTimeIcon className="h-4 w-4 mr-2 text-gray-500" />
                            <p className="text-sm">
                                <span className="font-medium">Days:</span> {leave.total_days}
                            </p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-sm font-medium mb-2">Leave Reason:</h3>
                        <div className="bg-gray-100 p-3 rounded-md min-h-[70px] max-h-[150px] overflow-auto">
                            <p className="text-sm break-words whitespace-pre-line">{leave.reason || "No reason provided."}</p>
                        </div>
                    </div>

                    {leave.status === '3' && leave.reject_reason && (
                        <div className="mb-4">
                            <h3 className="text-sm font-medium mb-2">Rejection Reason:</h3>
                            <div className="bg-red-50 p-3 rounded-md min-h-[70px] max-h-[150px] overflow-auto">
                                <p className="text-sm break-words whitespace-pre-line">{leave.reject_reason}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-auto">
                        <button
                            onClick={() => handleView(leave)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <VisibilityIcon className="h-4 w-4 mr-2" />
                            View
                        </button>

                        {leave.status === '1' && (
                            <>
                                <button
                                    onClick={() => handleReject(leave)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                >
                                    <CancelIcon className="h-4 w-4 mr-2" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleApprove(leave.leave_id)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                >
                                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                                    Approve
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-100 min-h-screen p-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h1 className="text-2xl font-bold mb-2">Leave Management System</h1>
                <p className="text-gray-500">Track and manage employee leave requests</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="flex border-b">
                    <button
                        className={`flex items-center px-4 py-3 text-sm font-medium ${tabValue === 0 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'} flex-1 justify-center`}
                        onClick={() => handleTabChange('1', 0)}
                    >
                        <AccessTimeIcon className="mr-2 h-5 w-5" />
                        Pending
                    </button>
                    <button
                        className={`flex items-center px-4 py-3 text-sm font-medium ${tabValue === 1 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'} flex-1 justify-center`}
                        onClick={() => handleTabChange('2', 1)}
                    >
                        <CheckCircleIcon className="mr-2 h-5 w-5" />
                        Approved
                    </button>
                    <button
                        className={`flex items-center px-4 py-3 text-sm font-medium ${tabValue === 2 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'} flex-1 justify-center`}
                        onClick={() => handleTabChange('3', 2)}
                    >
                        <CancelIcon className="mr-2 h-5 w-5" />
                        Rejected
                    </button>
                </div>
            </div>

            {/* Cards */}
            <div className="flex flex-wrap -mx-3">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((leave) => renderLeaveCard(leave))
                ) : (
                    <div className="w-full">
                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                            <h2 className="text-lg font-medium text-gray-700">No {getStatusByValue(selectedStatus)} Requests Found</h2>
                            <p className="text-gray-500 mt-2">There are no leave requests with {getStatusByValue(selectedStatus)} status.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Rejection Dialog */}
            {selectedLeave && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-medium">Provide Reason for Rejection</h2>
                        </div>
                        <div className="p-6">
                            <textarea
                                className="w-full border border-gray-300 rounded-md p-3 h-32 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter rejection reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                            <button
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                                onClick={() => {
                                    setSelectedLeave(null);
                                    setRejectionReason('');
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700"
                                onClick={submitRejection}
                            >
                                Submit Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Dialog */}
            {viewDialogOpen && viewDialogData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-medium">Leave Request Details</h2>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[70vh]">
                            <h3 className="text-lg font-medium mb-4">{viewDialogData.full_name}</h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Leave Type</h4>
                                    <p>{viewDialogData.leave_type}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                                    <div className="mt-1">
                                        {getStatusChip(viewDialogData.status)}
                                    </div>
                                </div>
                            </div>

                            <hr className="my-4" />

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
                                    <p>{formatDate(viewDialogData.start_date)}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-500">End Date</h4>
                                    <p>{formatDate(viewDialogData.end_date)}</p>
                                </div>
                                <div className="col-span-2">
                                    <h4 className="text-sm font-medium text-gray-500">Total Days</h4>
                                    <p>{viewDialogData.total_days}</p>
                                </div>
                            </div>

                            <hr className="my-4" />

                            <h4 className="text-sm font-medium text-gray-500 mb-2">Reason for Leave</h4>
                            <div className="bg-gray-100 p-4 rounded-md mb-4">
                                <p className="break-words">{viewDialogData.reason || "No reason provided."}</p>
                            </div>

                            {viewDialogData.status === '3' && viewDialogData.reject_reason && (
                                <>
                                    <h4 className="text-sm font-medium text-gray-500 mb-2">Rejection Reason</h4>
                                    <div className="bg-red-50 p-4 rounded-md">
                                        <p className="break-words">{viewDialogData.reject_reason}</p>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end rounded-b-lg">
                            <button
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                                onClick={handleCloseViewDialog}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Component */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </div>
    );
};

export default LeaveStatusPage;