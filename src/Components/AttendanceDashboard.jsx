/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Play, Pause, Calendar, Users, Coffee, UserCheck, FolderOpen, LogOut, Maximize2, Clock, ChevronRight, BarChart3, TrendingUp, Award, Bell } from 'lucide-react';
import api from '../api/axiosInstance';
import { Toast } from '../Components/Toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AttendanceDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workingTime, setWorkingTime] = useState(0); // in seconds
  const [isWorking, setIsWorking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null); // 1 = need to clock in, 2 = need to clock out
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Get user data from AuthContext
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Extract user_id and employee_id from the auth context
  const userId = user?.id || user?.user_id;
  const employeeId = user?.employee_id || user?.emp_id;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (isWorking) {
        setWorkingTime(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isWorking]);

  // Fetch current status and attendance data on component mount
  useEffect(() => {
    if (isAuthenticated() && userId && employeeId && !authLoading) {
      fetchCurrentStatus();
      fetchAttendanceData();
    }
  }, [userId, employeeId, authLoading]);

  // Toast helper functions
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

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
        if (status === 2) {
          setIsWorking(true);
        }
      } else {
        setCurrentStatus(1);
      }
    } catch (error) {
      console.error("Status fetch error:", error);
      setCurrentStatus(1);
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
        calculateWorkingTime(res.data.data);
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

  const calculateWorkingTime = (data) => {
    // Calculate today's working time from attendance data
    const today = new Date().toLocaleDateString('en-GB');
    const todayRecord = data.find(record =>
      new Date(record.created_at).toLocaleDateString('en-GB') === today
    );

    if (todayRecord && todayRecord.clock_in) {
      const clockIn = new Date(`${todayRecord.created_at} ${todayRecord.clock_in}`);
      const now = new Date();
      const clockOut = todayRecord.clock_out ?
        new Date(`${todayRecord.created_at} ${todayRecord.clock_out}`) : now;

      const diffInSeconds = Math.floor((clockOut - clockIn) / 1000);
      setWorkingTime(Math.max(0, diffInSeconds));
    }
  };

  const handleClockInOut = async () => {
    if (!userId || !employeeId) {
      showToast("Missing user credentials. Please log in again.", "error");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("employee_id", employeeId);

    try {
      const res = await api.post("emp_clock_in_and_clock_out", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success) {
        showToast(res.data.message, "success");

        // Update working state based on action
        if (currentStatus === 1) {
          setIsWorking(true);
        } else if (currentStatus === 2) {
          setIsWorking(false);
        }

        // Refresh both status and attendance data after successful clock in/out
        await Promise.all([fetchCurrentStatus(), fetchAttendanceData()]);
      } else {
        showToast(res.data.message || "Clock in/out failed", "error");
      }
    } catch (error) {
      console.error("Clock in/out error:", error);
      setError("Clock in/out failed. Try again.");
      showToast("Clock in/out failed. Try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTimer = () => {
    setIsWorking(!isWorking);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusInfo = () => {
    if (isLoadingStatus) {
      return {
        text: "Loading...",
        buttonText: "Loading...",
        buttonColor: "bg-gray-400",
        statusColor: "text-gray-600",
        statusBg: "bg-gray-50"
      };
    }

    if (currentStatus === 2) {
      return {
        text: "Clocked In",
        buttonText: "Clock Out",
        buttonColor: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
        statusColor: "text-green-600",
        statusBg: "bg-green-50"
      };
    } else {
      return {
        text: "Clocked Out",
        buttonText: "Clock In",
        buttonColor: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
        statusColor: "text-red-600",
        statusBg: "bg-red-50"
      };
    }
  };

  const statusInfo = getStatusInfo();
  const workingProgress = Math.min((workingTime / 28800) * 100, 100);

  const generateCalendar = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    const days = [];
    const today = now.getDate();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today;

      // Check if this day has attendance data
      const dayString = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const hasAttendance = attendanceData.some(record =>
        record.created_at && record.created_at.startsWith(dayString)
      );

      days.push(
        <div
          key={day}
          className={`w-8 h-8 flex items-center justify-center text-sm rounded-full cursor-pointer transition-all duration-200 transform hover:scale-110
            ${isToday ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-lg' : ''}
            ${hasAttendance && !isToday ? 'bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200' : ''}
            ${!hasAttendance && !isToday ? 'text-gray-600 hover:bg-gray-100' : ''}
          `}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const getMonthName = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };


  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please log in to view dashboard</p>
        </div>
      </div>
    );
  }

  // Show error if missing required user data
  if (!userId || !employeeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600">Missing user credentials. Please log in again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Middle Column - Welcome & Analytics */}
          <div className="lg:col-span-5 space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-blue-200 mb-2 font-medium">Hi {user?.full_name || 'User'} 👋</div>
                    <div className="text-3xl font-bold mb-2">{getGreeting()}</div>
                    <div className="text-blue-200">Ready to make today productive?</div>
                  </div>
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <div className="text-3xl">☀️</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>

              <div className="grid grid-cols-2 gap-4">

                {/* Projects */}
                <div
                  onClick={() => navigate("/projects")}
                  className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-purple-200 rounded-lg p-2 group-hover:bg-purple-300 transition-colors">
                      <FolderOpen size={20} className="text-purple-700" />
                    </div>
                    <span className="font-semibold text-gray-800">Projects</span>
                  </div>
                  <div className="text-sm text-gray-600">View active projects</div>
                </div>

                {/* Leave */}
                <div
                  onClick={() => navigate("/leave-application")}
                  className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-orange-200 rounded-lg p-2 group-hover:bg-orange-300 transition-colors">
                      <LogOut size={20} className="text-orange-700" />
                    </div>
                    <span className="font-semibold text-gray-800">Leave</span>
                  </div>
                  <div className="text-sm text-gray-600">Request time off</div>
                </div>

                {/* Breaks */}
                <div
                  onClick={() => navigate("/breaks")}
                  className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-green-200 rounded-lg p-2 group-hover:bg-green-300 transition-colors">
                      <Coffee size={20} className="text-green-700" />
                    </div>
                    <span className="font-semibold text-gray-800">Breaks</span>
                  </div>
                  <div className="text-sm text-gray-600">Track break time</div>
                </div>

                {/* Meetings */}
                <div
                  onClick={() => navigate("/meetings")}
                  className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-200 rounded-lg p-2 group-hover:bg-blue-300 transition-colors">
                      <Users size={20} className="text-blue-700" />
                    </div>
                    <span className="font-semibold text-gray-800">Meetings</span>
                  </div>
                  <div className="text-sm text-gray-600">Scheduled meetings</div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column - Calendar & Leave Stats */}
          <div className="lg:col-span-3 space-y-6">
            {/* Calendar */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Calendar</h3>
                <Calendar size={20} className="text-gray-500" />
              </div>

              <div className="text-center mb-6">
                <div className="text-lg font-bold text-gray-900">{getMonthName()}</div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-3">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-xs text-gray-500 text-center p-2 font-semibold">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {generateCalendar()}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Present</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-xs text-gray-600">Absent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;