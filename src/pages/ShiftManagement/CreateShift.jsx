import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Save, X, CheckCircle, AlertCircle, Info, RotateCcw, Settings, Eye, EyeOff, Users, Timer, Edit } from 'lucide-react';
import api from '../../api/axiosInstance';

// Toast Component with Professional Design
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

// Professional Loading Component
const LoadingSpinner = ({ message = "Loading shift configuration..." }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
            <div className="w-12 h-12 border-3 border-gray-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">{message}</p>
        </div>
    </div>
);

const CreateShift = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Get edit mode and shift ID from URL params
    const editShiftId = searchParams.get('edit');
    const isEditMode = !!editShiftId;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [previewMode, setPreviewMode] = useState(false);

    // Form data
    const [shiftName, setShiftName] = useState('');
    const [remark, setRemark] = useState('');
    const [dayList, setDayList] = useState([]);
    const [shiftTypes, setShiftTypes] = useState([]);
    const [occasionalDayList, setOccasionalDayList] = useState([]);

    // Show toast notification
    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    // Close toast
    const closeToast = () => {
        setToast(null);
    };

    // Apply default values to day list
    const applyDefaultValues = (days) => {
        return days.map(day => ({
            ...day,
            from_time: day.from_time || '09:00 PM',
            to_time: day.to_time || '06:00 AM',
            shift_type: day.shift_type || '1',
            occasional_days: day.occasional_days || ''
        }));
    };

    // Fetch shift day data (for creating new shifts)
    const fetchShiftDayData = async () => {
        try {
            const response = await api.post('shift_day_fetch');

            if (response.data.success) {
                const data = response.data.data;
                return {
                    dayList: data.day_list || [],
                    shiftTypes: data.shift_type || [],
                    occasionalDayList: data.day_occasional_list || []
                };
            } else {
                showToast(response.data.message || 'Failed to fetch shift data', 'error');
                return null;
            }
        } catch (err) {
            console.error('Error fetching shift data:', err);
            showToast('Failed to load shift data. Please try again.', 'error');
            return null;
        }
    };

    // Fetch existing shift details from shift_list API
    const fetchShiftDetailsFromList = async (shiftId) => {
        try {
            if (!user?.user_id) {
                showToast('Admin user ID is required.', 'error');
                return null;
            }

            const formData = new FormData();
            formData.append('user_id', user.user_id);

            const response = await api.post('shift_list', formData);

            if (response.data.success && Array.isArray(response.data.data)) {
                // Find the specific shift by ID
                const shiftDetails = response.data.data.find(shift =>
                    shift.shift_id === shiftId || shift.shift_id === parseInt(shiftId)
                );

                if (shiftDetails) {
                    return shiftDetails;
                } else {
                    showToast('Shift not found in the list', 'error');
                    return null;
                }
            } else {
                showToast(response.data.message || 'Failed to fetch shift list', 'error');
                return null;
            }
        } catch (err) {
            console.error('Error fetching shift list:', err);
            showToast('Failed to load shift details. Please try again.', 'error');
            return null;
        }
    };

    // Fetch existing shift data for editing using shift_list API
    const fetchExistingShiftData = async (shiftId) => {
        try {
            if (!user?.user_id) {
                showToast('Admin user ID is required.', 'error');
                return;
            }

            // First get the base shift day data
            const shiftDayData = await fetchShiftDayData();
            if (!shiftDayData) return;

            // Set the base data first
            setShiftTypes(shiftDayData.shiftTypes);
            setOccasionalDayList(shiftDayData.occasionalDayList);

            // Fetch the existing shift details from shift_list API
            const shiftDetails = await fetchShiftDetailsFromList(shiftId);

            if (!shiftDetails) {
                // Apply defaults if fetch fails
                setDayList(applyDefaultValues(shiftDayData.dayList));
                return;
            }

            // Set basic shift information
            setShiftName(shiftDetails.shift_name || '');
            setRemark(shiftDetails.remark || '');

            // Merge existing shift data with base day list
            if (Array.isArray(shiftDetails.shift_days) && shiftDetails.shift_days.length > 0) {
                const mergedDayList = shiftDayData.dayList.map(day => {
                    const existingDay = shiftDetails.shift_days.find(
                        shiftDay => shiftDay.day_id === day.day_id ||
                            shiftDay.day_id === parseInt(day.day_id)
                    );

                    if (existingDay) {
                        return {
                            ...day,
                            from_time: existingDay.from_time || day.from_time || '09:00 PM',
                            to_time: existingDay.to_time || day.to_time || '06:00 AM',
                            shift_type: existingDay.shift_type || day.shift_type || '1',
                            occasional_days: existingDay.occasional_days || day.occasional_days || ''
                        };
                    } else {
                        // Apply defaults for days not in existing shift
                        return {
                            ...day,
                            from_time: day.from_time || '09:00 PM',
                            to_time: day.to_time || '06:00 AM',
                            shift_type: day.shift_type || '1',
                            occasional_days: day.occasional_days || ''
                        };
                    }
                });
                setDayList(mergedDayList);
            } else {
                // No existing shift days, apply defaults
                setDayList(applyDefaultValues(shiftDayData.dayList));
            }

            showToast('Shift details loaded successfully', 'success');
        } catch (err) {
            console.error('Error:', err);
            showToast('Failed to load shift details.', 'error');

            // Try to load at least the base data on error
            const shiftDayData = await fetchShiftDayData();
            if (shiftDayData) {
                setShiftTypes(shiftDayData.shiftTypes);
                setOccasionalDayList(shiftDayData.occasionalDayList);
                setDayList(applyDefaultValues(shiftDayData.dayList));
            }
        }
    };

    // Initialize data on component mount
    useEffect(() => {
        const initializeData = async () => {
            if (!user?.user_id) return; // prevent API call if user ID is not ready

            setLoading(true);
            try {
                if (isEditMode && editShiftId) {
                    await fetchExistingShiftData(editShiftId);
                } else {
                    // For new shift creation
                    const shiftDayData = await fetchShiftDayData();
                    if (shiftDayData) {
                        setShiftTypes(shiftDayData.shiftTypes);
                        setOccasionalDayList(shiftDayData.occasionalDayList);
                        setDayList(applyDefaultValues(shiftDayData.dayList));
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, [isEditMode, editShiftId, user?.user_id]);

    // Handle day data change
    const handleDayChange = (dayId, field, value) => {
        setDayList(prevDays =>
            prevDays.map(day =>
                day.day_id === dayId
                    ? { ...day, [field]: value }
                    : day
            )
        );
    };

    // Handle occasional day selection
    const handleOccasionalDayChange = (dayId, occasionalId, checked) => {
        setDayList(prevDays =>
            prevDays.map(day => {
                if (day.day_id === dayId) {
                    let occasionalDays = day.occasional_days ? day.occasional_days.split(',').filter(id => id) : [];

                    if (checked) {
                        if (!occasionalDays.includes(occasionalId)) {
                            occasionalDays.push(occasionalId);
                        }
                    } else {
                        occasionalDays = occasionalDays.filter(id => id !== occasionalId);
                    }

                    return { ...day, occasional_days: occasionalDays.join(',') };
                }
                return day;
            })
        );
    };

    // Validate form data
    const validateForm = () => {
        if (!shiftName.trim()) {
            showToast('Shift name is required to proceed', 'error');
            return false;
        }

        const hasValidDay = dayList.some(day => {
            return day.from_time && day.to_time && day.shift_type;
        });

        if (!hasValidDay) {
            showToast('Please configure at least one day with valid schedule', 'error');
            return false;
        }

        const invalidOccasionalDays = dayList.some(day => {
            if (day.shift_type === "3") {
                return !day.occasional_days || day.occasional_days.trim() === '';
            }
            return false;
        });

        if (invalidOccasionalDays) {
            showToast('Please select occasional days for "Occasional Working Day" shifts', 'error');
            return false;
        }

        return true;
    };

    // Generate time options
    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                const ampm = hour < 12 ? 'AM' : 'PM';
                const time12 = `${hour12.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
                times.push({ value: time12, label: time12 });
            }
        }
        return times;
    };

    const timeOptions = generateTimeOptions();

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!user?.user_id) {
            showToast('Authentication required. Please log in again.', 'error');
            return;
        }

        try {
            setSubmitting(true);

            const formData = new FormData();
            formData.append('user_id', user.user_id);
            formData.append('shift_name', shiftName.trim());
            formData.append('remark', remark.trim());

            // Add shift_id for edit mode
            if (isEditMode && editShiftId) {
                formData.append('shift_id', editShiftId);
                formData.append('action', 'update');
            }

            const validDays = dayList.filter(day =>
                day.from_time && day.to_time && day.shift_type
            );

            validDays.forEach(day => {
                formData.append('day_id[]', day.day_id);
                formData.append('from_time[]', day.from_time);
                formData.append('to_time[]', day.to_time);
                formData.append('shift_type[]', day.shift_type);

                const occasionalKey = `occasional_day_${day.day_id}`;
                formData.append(occasionalKey, day.occasional_days || '');
            });

            const response = await api.post('shift_create', formData);

            if (response.data.success) {
                const successMessage = isEditMode
                    ? 'Shift updated successfully! Redirecting...'
                    : 'Shift created successfully! Redirecting...';
                showToast(successMessage, 'success');
                setTimeout(() => {
                    navigate('/shift-management');
                }, 2000);
            } else {
                const errorMessage = isEditMode
                    ? 'Failed to update shift. Please try again.'
                    : 'Failed to create shift. Please try again.';
                showToast(response.data.message || errorMessage, 'error');
            }
        } catch (err) {
            console.error('Error submitting shift:', err);
            showToast('Network error. Please check your connection and try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // Reset day to defaults
    const resetDayToDefaults = (dayId) => {
        handleDayChange(dayId, 'from_time', '09:00 PM');
        handleDayChange(dayId, 'to_time', '06:00 AM');
        handleDayChange(dayId, 'shift_type', '1');
        handleDayChange(dayId, 'occasional_days', '');
        showToast('Day reset to default values', 'info');
    };

    // Reset all days to defaults
    const resetAllToDefaults = () => {
        dayList.forEach(day => {
            resetDayToDefaults(day.day_id);
        });
        showToast('All days reset to default configuration', 'info');
    };

    if (loading) {
        const loadingMessage = isEditMode
            ? "Loading shift details for editing..."
            : "Loading shift configuration...";
        return <LoadingSpinner message={loadingMessage} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/shift-management')}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEditMode ? 'bg-orange-600' : 'bg-blue-600'}`}>
                                    {isEditMode ? <Edit className="w-5 h-5 text-white" /> : <Calendar className="w-5 h-5 text-white" />}
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        {isEditMode ? 'Edit Shift' : 'Create New Shift'}
                                    </h1>
                                    <p className="text-sm text-gray-500">
                                        {isEditMode
                                            ? 'Modify existing work schedule and shift parameters'
                                            : 'Configure work schedule and shift parameters'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setPreviewMode(!previewMode)}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                {previewMode ? 'Edit' : 'Preview'}
                            </button>
                            <button
                                type="button"
                                onClick={resetAllToDefaults}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Basic Information */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-gray-500" />
                                <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
                                {isEditMode && (
                                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                        Editing
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Shift Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={shiftName}
                                        onChange={(e) => setShiftName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter shift name"
                                        required
                                        disabled={previewMode}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Remark
                                    </label>
                                    <input
                                        type="text"
                                        value={remark}
                                        onChange={(e) => setRemark(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Optional notes"
                                        disabled={previewMode}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Schedule */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-gray-500" />
                                    <h2 className="text-lg font-medium text-gray-900">Weekly Schedule</h2>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Default: 9:00 PM - 6:00 AM
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-6">
                                {dayList.map((day) => {
                                    const isConfigured = day.from_time && day.to_time && day.shift_type;
                                    return (
                                        <div key={day.day_id} className="border border-gray-200 rounded-lg">
                                            {/* Day Header */}
                                            <div className={`px-4 py-3 border-b border-gray-200 ${isConfigured ? 'bg-green-50' : 'bg-gray-50'}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white ${isConfigured ? 'bg-green-500' : 'bg-gray-400'}`}>
                                                            {day.day_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">{day.day_name}</h3>
                                                            <p className="text-sm text-gray-500">
                                                                {isConfigured ? 'Configured' : 'Not configured'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {!previewMode && (
                                                        <button
                                                            type="button"
                                                            onClick={() => resetDayToDefaults(day.day_id)}
                                                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                                        >
                                                            <RotateCcw className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Day Configuration */}
                                            <div className="p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    {/* Start Time */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Start Time <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            value={day.from_time}
                                                            onChange={(e) => handleDayChange(day.day_id, 'from_time', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                                            required
                                                            disabled={previewMode}
                                                        >
                                                            {timeOptions.map(time => (
                                                                <option key={time.value} value={time.value}>
                                                                    {time.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* End Time */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            End Time <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            value={day.to_time}
                                                            onChange={(e) => handleDayChange(day.day_id, 'to_time', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                                            required
                                                            disabled={previewMode}
                                                        >
                                                            {timeOptions.map(time => (
                                                                <option key={time.value} value={time.value}>
                                                                    {time.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Shift Type */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Shift Type <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            value={day.shift_type}
                                                            onChange={(e) => handleDayChange(day.day_id, 'shift_type', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                                            required
                                                            disabled={previewMode}
                                                        >
                                                            {shiftTypes.map(type => (
                                                                <option key={type.id} value={type.id}>
                                                                    {type.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    {/* Occasional Days */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Occasional Days {day.shift_type === "3" && <span className="text-red-500">*</span>}
                                                        </label>
                                                        {day.shift_type === "3" ? (
                                                            <div className="border border-gray-300 rounded-md p-2 bg-white max-h-20 overflow-y-auto">
                                                                <div className="space-y-1">
                                                                    {occasionalDayList.map(occasional => (
                                                                        <label key={occasional.id} className="flex items-center gap-2 cursor-pointer text-sm">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={(day.occasional_days || '').split(',').includes(occasional.id)}
                                                                                onChange={(e) => handleOccasionalDayChange(day.day_id, occasional.id, e.target.checked)}
                                                                                className="w-3 h-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                                disabled={previewMode}
                                                                            />
                                                                            <span className="text-gray-700">{occasional.name}</span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="border border-gray-200 rounded-md p-2 bg-gray-50 text-center">
                                                                <p className="text-xs text-gray-500">
                                                                    Select "Occasional Working Day" to configure
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {!previewMode && (
                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate('/shift-management')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`px-6 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:ring-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${isEditMode
                                    ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                    }`}
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        {isEditMode ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        {isEditMode ? 'Update Shift' : 'Create Shift'}
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>

                {/* Toast Notification */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={closeToast}
                    />
                )}
            </div>
        </div>
    );
};

export default CreateShift;