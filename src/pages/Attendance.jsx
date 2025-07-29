import React, { useState, useEffect } from 'react';
import { Clock, LogOut, Calendar, User, Activity, Timer } from 'lucide-react';
import api from '../api/axiosInstance';
import { Toast } from '../Components/Toast';
import { useAuth } from '../context/AuthContext'; // Import the auth context

const Attendance = () => {
    const [error, setError] = useState("");
    const [attendanceData, setAttendanceData] = useState([]);
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);
    const [currentStatus, setCurrentStatus] = useState(null); // 1 = need to clock in, 2 = need to clock out
    const [isLoadingStatus, setIsLoadingStatus] = useState(true);
    const [toast, setToast] = useState(null);

    // Get user data from AuthContext instead of cookies
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();

    // Extract user_id and employee_id from the auth context
    const userId = user?.id || user?.user_id;
    const employeeId = user?.employee_id || user?.emp_id;

    // Fetch current status and attendance data on component mount
    useEffect(() => {
        // Only fetch data if user is authenticated and we have the required IDs
        if (isAuthenticated() && userId && employeeId && !authLoading) {
            fetchCurrentStatus();
            fetchAttendanceData();
        }
    }, [userId, employeeId, authLoading]); // Dependencies updated to include auth state


    const fetchCurrentStatus = async () => {
        if (!userId || !employeeId) {
            console.error("Missing user credentials");
            setCurrentStatus(1);
            setIsLoadingStatus(false);
            return;
        }

        setIsLoadingStatus(true);

        const formData = new FormData();
        formData.append("user_id", userId);
        formData.append("employee_id", employeeId);

        try {
            const res = await api.post("emp_attendance_current_status", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data && res.data.success && res.data.data) {
                const status = parseInt(res.data.data.status);
                setCurrentStatus(status);
            } else {
                setCurrentStatus(1); // Default to need clock in
            }
        } catch (error) {
            console.error("Status fetch error:", error);
            setCurrentStatus(1); // Default to need clock in on error
            setError("Failed to fetch attendance status. Please try again.");
        } finally {
            setIsLoadingStatus(false);
        }
    };

    const fetchAttendanceData = async () => {
        if (!userId || !employeeId) {
            console.error("Missing user credentials");
            setIsLoadingAttendance(false);
            return;
        }

        setIsLoadingAttendance(true);
        setError("");

        const formData = new FormData();
        formData.append("user_id", userId);
        formData.append("employee_id", employeeId);

        try {
            const res = await api.post("emp_attendance_list", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data && res.data.success && res.data.data) {
                setAttendanceData(res.data.data);
            } else {
                setAttendanceData([]);
            }
        } catch (error) {
            setError("Failed to fetch attendance data. Please try again.");
            console.error("Attendance fetch error:", error);
        } finally {
            setIsLoadingAttendance(false);
        }
    };


    const getCurrentDateTime = () => {
        const now = new Date();
        return {
            date: now.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }),
            time: now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        };
    };

    const { date: currentDate, time: currentTime } = getCurrentDateTime();

    const getStatusInfo = () => {
        if (isLoadingStatus) return {
            text: "Loading...",
            color: "text-gray-500",
            bgColor: "bg-gray-100",
            buttonText: "Loading...",
            buttonColor: "bg-gray-400"
        };

        if (currentStatus === 1 || currentStatus === "1") {
            // Status 1 = Need to clock in
            return {
                text: "Clocked Out",
                color: "text-orange-600",
                bgColor: "bg-orange-50",
                buttonText: "Clock In",
                buttonColor: "bg-green-500 hover:bg-green-600"
            };
        } else if (currentStatus === 2 || currentStatus === "2") {
            // Status 2 = Need to clock out (currently clocked in)
            return {
                text: "Clocked In",
                color: "text-green-600",
                bgColor: "bg-green-50",
                buttonText: "Clock Out",
                buttonColor: "bg-red-500 hover:bg-red-600"
            };
        } else {
            // Default to need clock in
            return {
                text: "Clocked Out",
                color: "text-orange-600",
                bgColor: "bg-orange-50",
                buttonText: "Clock In",
                buttonColor: "bg-green-500 hover:bg-green-600"
            };
        }
    };

    const statusInfo = getStatusInfo();

    // Show loading state while auth is loading
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Clock className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show error if not authenticated
    if (!isAuthenticated()) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Please log in to view attendance</p>
                </div>
            </div>
        );
    }

    // Show error if missing required user data
    if (!userId || !employeeId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                        <p className="text-red-600">Missing user credentials. Please log in again.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Welcome Message */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome, {user?.full_name || 'User'}
                    </h1>
                    <p className="text-gray-600">
                        Today: {currentDate} {currentTime}
                    </p>
                </div>

                {/* Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Current Status Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${(currentStatus === 2 || currentStatus === "2") ? 'bg-green-100' : 'bg-orange-100'
                                    }`}>
                                    <Activity className={`h-5 w-5 ${(currentStatus === 2 || currentStatus === "2") ? 'text-green-600' : 'text-orange-600'
                                        }`} />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 font-semibold">Current Status</h3>
                                    <p className={`text-sm ${statusInfo.color}`}>{statusInfo.text}</p>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                                {statusInfo.text}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {/* Attendance Table */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <span>Attendance History</span>
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoadingAttendance ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center space-x-2 text-gray-500">
                                    <Clock className="h-5 w-5 animate-spin" />
                                    <span>Loading attendance data...</span>
                                </div>
                            </div>
                        ) : attendanceData.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No attendance records found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left px-6 py-4 text-gray-700 font-semibold border-b border-gray-200">Date</th>
                                        <th className="text-left px-6 py-4 text-gray-700 font-semibold border-b border-gray-200">Clock In</th>
                                        <th className="text-left px-6 py-4 text-gray-700 font-semibold border-b border-gray-200">Clock Out</th>
                                        <th className="text-left px-6 py-4 text-gray-700 font-semibold border-b border-gray-200">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {attendanceData.map((entry) => (
                                        <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-900 font-medium">{entry.created_at}</td>
                                            <td className="px-6 py-4 text-gray-700">{entry.clock_in}</td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {entry.clock_out || <span className="text-gray-400">--</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${entry.status === "1"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-gray-100 text-gray-700"
                                                    }`}>
                                                    {entry.status === "1" ? "Active" : "Completed"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;