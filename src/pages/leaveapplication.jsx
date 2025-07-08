import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Cookies from 'js-cookie';

const LeaveApplication = () => {
    const [formData, setFormData] = useState({
        user_id: '',
        employee_id: '',
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: ''
    });

    const [leaveTypes, setLeaveTypes] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [notification, setNotification] = useState({ show: false, type: '', message: '' });

    // Set user_id and employee_id from cookies and localStorage
    useEffect(() => {
        const userId = Cookies.get('user_id');
        const employeeId = Cookies.get('employee_id');

        if (userId && employeeId) {
            setFormData(prev => ({
                ...prev,
                user_id: userId,
                employee_id: employeeId
            }));
        }
    }, []);

    // Fetch leave types on component mount
    useEffect(() => {
        fetchLeaveTypes();
    }, []);

    const fetchLeaveTypes = async () => {
        try {
            const response = await api.post('/leave_type_drop_down');

            if (response.data.success && response.data.data.leave_type_list) {
                // Get leave_type_list from the response
                const leaveTypeData = response.data.data.leave_type_list || [];
                setLeaveTypes(Array.isArray(leaveTypeData) ? leaveTypeData : []);
            } else {
                setLeaveTypes([]);
            }
        } catch (error) {
            console.error('Error fetching leave types:', error);
            setLeaveTypes([]); // Set empty array on error
            setNotification({
                show: true,
                type: 'error',
                message: error.message || 'Failed to fetch leave types'
            });
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const formatDateForAPI = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    // Handle start date change and clear end date if it's before the new start date
    const handleStartDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            start_date: date,
            // Clear end date if it's before the new start date
            end_date: prev.end_date && date && prev.end_date < date ? '' : prev.end_date
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.employee_id) {
            setNotification({
                show: true,
                type: 'error',
                message: 'Employee ID is not available. Please login again.'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const submitData = new FormData();
            submitData.append('user_id', formData.user_id);
            submitData.append('employee_id', formData.employee_id);
            submitData.append('leave_type', formData.leave_type);
            submitData.append('start_date', formatDateForAPI(formData.start_date));
            submitData.append('end_date', formatDateForAPI(formData.end_date));
            submitData.append('reason', formData.reason);

            const response = await api.post('/add_leave', submitData);

            setNotification({
                show: true,
                type: 'success',
                message: response.data.message || 'Leave request submitted successfully!'
            });

            // Reset form
            setFormData({
                user_id: Cookies.get('user_id') || '',
                employee_id: Cookies.get('employee_id') || '',
                leave_type: '',
                start_date: '',
                end_date: '',
                reason: ''
            });

        } catch (error) {
            setNotification({
                show: true,
                type: 'error',
                message: error.response?.data?.message || 'Failed to submit leave request'
            });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => {
                setNotification({ show: false, type: '', message: '' });
            }, 5000);
        }
    };

    const resetForm = () => {
        setFormData({
            user_id: Cookies.get('user_id') || '',
            employee_id: Cookies.get('employee_id') || '',
            leave_type: '',
            start_date: '',
            end_date: '',
            reason: ''
        });
    };

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isLoadingData) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8 w-full">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="bg-blue-600 py-4 px-6">
                        <h2 className="text-xl font-bold text-white">Apply for Leave</h2>
                    </div>
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 w-full">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-blue-600 py-4 px-6">
                    <h2 className="text-xl font-bold text-white">Apply for Leave</h2>
                </div>

                {notification.show && (
                    <div className={`mx-6 mt-4 px-4 py-3 text-sm font-medium rounded-md ${notification.type === 'success'
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-red-100 text-red-700 border border-red-300'
                        }`}>
                        {notification.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Employee Info Display */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Employee Name
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                            {(() => {
                                try {
                                    const employeeData = JSON.parse(localStorage.getItem('employee_data') || '{}');
                                    return employeeData.full_name || employeeData.name || 'Current User';
                                } catch (error) {
                                    return 'Current User' (error);
                                }
                            })()}
                        </div>
                    </div>

                    {/* Leave Type Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Leave Type *
                        </label>
                        <select
                            name="leave_type"
                            value={formData.leave_type}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select leave type</option>
                            {Array.isArray(leaveTypes) && leaveTypes.map((leaveType) => (
                                <option key={leaveType.leave_type_id} value={leaveType.leave_type_id}>
                                    {leaveType.leave_type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Start Date */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={formData.start_date}
                                    onChange={handleStartDateChange}
                                    dateFormat="dd-MM-yyyy"
                                    placeholderText="DD-MM-YYYY"
                                    minDate={today}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
                                    📅
                                </div>
                            </div>
                        </div>

                        {/* End Date */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-800">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={formData.end_date}
                                    onChange={(date) =>
                                        setFormData({ ...formData, end_date: date })
                                    }
                                    dateFormat="dd-MM-yyyy"
                                    placeholderText="DD-MM-YYYY"
                                    minDate={formData.start_date || today}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <div className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
                                    📅
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Reason for Leave *
                        </label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            required
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Please provide details about your leave request"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end pt-4 space-x-4">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeaveApplication;