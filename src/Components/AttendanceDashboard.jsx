/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Play, Pause, Calendar, Users, Coffee, UserCheck, FolderOpen, LogOut, Maximize2, Clock, ChevronRight, BarChart3, TrendingUp, Award, Bell, Timer, Target, CheckCircle, XCircle } from 'lucide-react';
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

  const formatTimeShort = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}mins`;
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
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

    // Add days of the month with attendance data from API
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
            ${isToday ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold shadow-lg' : ''}
            ${hasAttendance && !isToday ? 'bg-orange-100 text-orange-700 font-semibold hover:bg-orange-200' : ''}
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
    return new Date().toLocaleDateString('en-US', { month: 'long' });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const statusInfo = getStatusInfo();
  const workingProgress = Math.min((workingTime / 28800) * 100, 100);

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
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
          
          {/* Left Column - Stats */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Time Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="grid grid-cols-2 gap-6">
                
                {/* Average Hours */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">Average hours</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {workingTime > 0 ? formatTimeShort(workingTime) : "7h 17mins"}
                  </div>
                </div>

                {/* Average Check-in */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                      <Timer className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">Average check-in</div>
                  <div className="text-2xl font-bold text-gray-900">10:33 AM</div>
                </div>

              </div>

              <div className="border-t border-gray-100 mt-6 pt-6">
                <div className="grid grid-cols-2 gap-6">
                  
                  {/* On-time Arrival */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mb-1">On-time arrival</div>
                    <div className="text-2xl font-bold text-green-600">98.56%</div>
                  </div>

                  {/* Average Check-out */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                        <LogOut className="w-6 h-6 text-red-600" />
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mb-1">Average check-out</div>
                    <div className="text-2xl font-bold text-gray-900">19:12 PM</div>
                  </div>

                </div>
              </div>
            </div>

            {/* Attendance Chart */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">My Attendance</h3>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">View Stats</button>
              </div>

              {/* Circular Progress */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="#f3f4f6"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${workingProgress * 3.14} 314`}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">1,434</div>
                      <div className="text-xs text-gray-500">Total Hours</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">1,031 on time</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">191 work from home</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">212 late attendance</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">66 absent</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Better than 91.3% employees!
                </div>
              </div>
            </div>

          </div>

          {/* Middle Column - Welcome & Quick Status */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Welcome Card with Clock Controls */}
            <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-xl shadow-xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-orange-100 mb-1 font-medium">Hi, {user?.full_name || 'User'} 👋</div>
                    <div className="text-2xl font-bold mb-2">{getGreeting()}</div>
                    <div className="text-orange-100">Have a good day</div>
                  </div>
                  <div className="w-20 h-20 flex items-center justify-center">
                    <div className="text-6xl">🧡</div>
                  </div>
                </div>

                {/* Clock In/Out Button */}
                <button
                  onClick={handleClockInOut}
                  disabled={isLoading || isLoadingStatus}
                  className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 disabled:bg-white/10 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-3"
                >
                  {isLoading ? (
                    <Clock className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      {currentStatus === 2 ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      <span>{statusInfo.buttonText}</span>
                    </>
                  )}
                </button>

                {/* Current Time Display */}
                <div className="mt-4 text-center">
                  <div className="text-white/80 text-sm">Current Time</div>
                  <div className="text-xl font-mono font-bold">{formatCurrentTime()}</div>
                </div>
              </div>
            </div>

            {/* Quick Status Cards */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick status</h3>
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* Projects */}
                <div
                  onClick={() => navigate("/projects")}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-4 h-4 text-blue-700" />
                    </div>
                    <span className="font-semibold text-gray-800">Project</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">View active projects</p>
                </div>

                {/* Leave */}
                <div
                  onClick={() => navigate("/leave-application")}
                  className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-orange-700" />
                    </div>
                    <span className="font-semibold text-gray-800">Leave</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">Request time off</p>
                  <div className="mt-2 text-xs text-orange-600 font-medium">--</div>
                </div>

                {/* Breaks */}
                <div
                  onClick={() => navigate("/breaks")}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                      <Coffee className="w-4 h-4 text-purple-700" />
                    </div>
                    <span className="font-semibold text-gray-800">Breaks</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">Track break time</p>
                </div>

                {/* Meeting */}
                <div
                  onClick={() => navigate("/meetings")}
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-green-700" />
                    </div>
                    <span className="font-semibold text-gray-800">Meeting</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">Scheduled meetings</p>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column - Calendar & Leave Stats */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Calendar</h3>
                <Maximize2 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>

              <div className="text-center mb-4">
                <div className="text-xl font-bold text-gray-900">{getMonthName()}</div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs text-gray-500 text-center p-1 font-medium">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {generateCalendar()}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Present</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-xs text-gray-600">Absent</span>
                </div>
              </div>
            </div>

            {/* Leave Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Leave stats</h3>
                <Maximize2 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>

              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="45"
                      stroke="#f3f4f6"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="45"
                      stroke="#f97316"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(16/20) * 283} 283`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">16</div>
                      <div className="text-xs text-gray-500">Days</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-lg font-semibold text-gray-900 mb-1">16/20</div>
                
                <button className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
                  Apply for leave
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;