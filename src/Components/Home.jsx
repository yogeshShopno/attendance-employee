import React, { useState, useEffect } from 'react';
import { Clock, LogOut, Calendar, User, Activity, Timer } from 'lucide-react';
import api from '../api/axiosInstance';
import Cookies from 'js-cookie';
import { Toast } from './Toast';

const Home = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);
  const [currentStatus, setCurrentStatus] = useState(null); // 1 = need to clock in, 2 = need to clock out
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const userId = Cookies.get('user_id');
  const employeeId = Cookies.get('employee_id');
  const [toast, setToast] = useState(null);

  // Fetch current status and attendance data on component mount
  useEffect(() => {
    fetchCurrentStatus();
    fetchAttendanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toast helper functions
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };


  const fetchCurrentStatus = async () => {
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
    } finally {
      setIsLoadingStatus(false);
    }

  };

  const fetchAttendanceData = async () => {
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
      }
    } catch (error) {
      setError("Failed to fetch attendance data. Please try again.");
      console.error("Attendance fetch error:", error);
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  const handleClockInOut = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("employee_id", employeeId);

    try {
      // eslint-disable-next-line no-unused-vars
      const res = await api.post("emp_clock_in_and_clock_out", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success) {
        // Refresh both status and attendance data after successful clock in/out
        showToast(res.data.message, "success");

        await Promise.all([fetchCurrentStatus(), fetchAttendanceData()]);


      } else {
        showToast(res.data.message, "error");

      }

    } catch (error) {
      console.log(error)
      setError("Clock in/out failed. Try again.");
      console.error("Clock in/out error:", error);
    } finally {
      setIsLoading(false);
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

            <button
              onClick={handleClockInOut}
              disabled={isLoading || isLoadingStatus}
              className={`w-full ${statusInfo.buttonColor} disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md`}
            >
              <Clock className="h-4 w-4" />
              <span>{isLoading ? "Processing..." : statusInfo.buttonText}</span>
            </button>
          </div>

          {/* Time Tracking Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Timer className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold">Time Tracking</h3>
                <p className="text-gray-500 text-sm">Today's Progress</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Target End Time</span>
                <span className="text-gray-900 font-medium">6:30 PM</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time Remaining</span>
                <span className="text-purple-600 font-medium">7 hrs 26 min</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-semibold">This Month</h3>
                <p className="text-gray-500 text-sm">Attendance Summary</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Records</span>
                <span className="text-gray-900 font-medium">{attendanceData.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">This Week</span>
                <span className="text-emerald-600 font-medium">5 days</span>
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

export default Home;