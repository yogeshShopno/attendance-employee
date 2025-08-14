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
        buttonColor: "bg-[var(--color-bg-gray-light)]",
        statusColor: "text-[var(--color-text-muted)]",
        statusBg: "bg-[var(--color-bg-gray-light)]"
      };
    }

    if (currentStatus === 2) {
      return {
        text: "Clocked In",
        buttonText: "Clock Out",
        buttonColor: "bg-gradient-to-r from-[var(--color-error)] to-[var(--color-error-dark)] hover:from-[var(--color-error-dark)] hover:to-[var(--color-error-darker)]",
        statusColor: "text-[var(--color-success-medium)]",
        statusBg: "bg-[var(--color-success-light)]"
      };
    } else {
      return {
        text: "Clocked Out",
        buttonText: "Clock In",
        buttonColor: "bg-gradient-to-r from-[var(--color-blue)] to-[var(--color-blue-dark)] hover:from-[var(--color-blue-dark)] hover:to-[var(--color-blue-darker)]",
        statusColor: "text-[var(--color-error-dark)]",
        statusBg: "bg-[var(--color-error-light)]"
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
            ${isToday ? 'bg-gradient-to-r from-[var(--color-blue)] to-[var(--color-blue-dark)] text-[var(--color-text-white)] font-bold shadow-lg' : ''}
            ${hasAttendance && !isToday ? 'bg-[var(--color-blue-lightest)] text-[var(--color-blue-dark)] font-semibold hover:bg-[var(--color-blue-lighter)]' : ''}
            ${!hasAttendance && !isToday ? 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]' : ''}
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
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin text-[var(--color-blue)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] flex items-center justify-center">
        <div className="text-center">
          <UserCheck className="h-12 w-12 text-[var(--color-text-muted)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">Please log in to view dashboard</p>
        </div>
      </div>
    );
  }

  // Show error if missing required user data
  if (!userId || !employeeId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-bg-gradient-start)] to-[var(--color-bg-gradient-end)] flex items-center justify-center">
        <div className="text-center">
          <div className="bg-[var(--color-error-light)] border border-[var(--color-error-lighter)] rounded-lg p-6 max-w-md mx-auto">
            <p className="text-[var(--color-text-error)]">Missing user credentials. Please log in again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--color-bg-primary)] p-4 md:p-6 overflow-y-auto">      {/* Toast Notification */}
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
            <div className="bg-[var(--color-bg-card)] rounded-xl shadow-sm p-6 border border-[var(--color-border-primary)]">
              <div className="grid grid-cols-2 gap-6">

                {/* Average Hours */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-[var(--color-icon-blue-bg)] rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-[var(--color-blue)]" />
                    </div>
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)] mb-1">Average hours</div>
                  <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                    {workingTime > 0 ? formatTimeShort(workingTime) : "7h 17mins"}
                  </div>
                </div>

                {/* Average Check-in */}
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-12 h-12 bg-[var(--color-icon-success-bg)] rounded-full flex items-center justify-center">
                      <Timer className="w-6 h-6 text-[var(--color-success-medium)]" />
                    </div>
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)] mb-1">Average check-in</div>
                  <div className="text-2xl font-bold text-[var(--color-text-primary)]">10:33 AM</div>
                </div>

              </div>

              <div className="border-t border-[var(--color-border-divider)] mt-6 pt-6">
                <div className="grid grid-cols-2 gap-6">

                  {/* On-time Arrival */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 bg-[var(--color-icon-success-bg)] rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-[var(--color-success-medium)]" />
                      </div>
                    </div>
                    <div className="text-sm text-[var(--color-text-secondary)] mb-1">On-time arrival</div>
                    <div className="text-2xl font-bold text-[var(--color-success-medium)]">98.56%</div>
                  </div>

                  {/* Average Check-out */}
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 bg-[var(--color-icon-error-bg)] rounded-full flex items-center justify-center">
                        <LogOut className="w-6 h-6 text-[var(--color-error-dark)]" />
                      </div>
                    </div>
                    <div className="text-sm text-[var(--color-text-secondary)] mb-1">Average check-out</div>
                    <div className="text-2xl font-bold text-[var(--color-text-primary)]">19:12 PM</div>
                  </div>

                </div>
              </div>
            </div>

            {/* Attendance Chart */}
            <div className="bg-[var(--color-bg-card)] rounded-xl shadow-sm p-6 border border-[var(--color-border-primary)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">My Attendance</h3>
                <button className="text-[var(--color-text-blue)] text-sm font-medium hover:text-[var(--color-blue-dark)]">View Stats</button>
              </div>

              {/* Circular Progress */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      stroke="var(--color-bg-gray-light)"
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
                        <stop offset="0%" stopColor="var(--color-success)" />
                        <stop offset="100%" stopColor="var(--color-blue)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[var(--color-text-primary)]">1,434</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">Total Hours</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[var(--color-success)] rounded-full"></div>
                    <span className="text-sm text-[var(--color-text-secondary)]">1,031 on time</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[var(--color-warning)] rounded-full"></div>
                    <span className="text-sm text-[var(--color-text-secondary)]">191 work from home</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[var(--color-error)] rounded-full"></div>
                    <span className="text-sm text-[var(--color-text-secondary)]">212 late attendance</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[var(--color-text-muted)] rounded-full"></div>
                    <span className="text-sm text-[var(--color-text-secondary)]">66 absent</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--color-border-divider)]">
                <div className="flex items-center text-sm text-[var(--color-success-medium)]">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Better than 91.3% employees!
                </div>
              </div>
            </div>

          </div>

          {/* Middle Column - Welcome & Quick Status */}
          <div className="lg:col-span-5 space-y-6">

            {/* Welcome Card with Clock Controls */}
            <div className="bg-gradient-to-br from-[var(--color-blue)] via-[var(--color-blue-dark)] to-[var(--color-blue-darker)] rounded-xl shadow-xl p-8 text-[var(--color-text-white)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-bg-secondary-20)] rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--color-bg-secondary-20)] rounded-full -ml-12 -mb-12"></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-[var(--color-text-white-90)] mb-1 font-medium">Hi, {user?.full_name || 'User'} 👋</div>
                    <div className="text-2xl font-bold mb-2">{getGreeting()}</div>
                    <div className="text-[var(--color-text-white-90)]">Have a good day</div>
                  </div>
                </div>

                {/* Clock In/Out Button */}
                <button
                  onClick={handleClockInOut}
                  disabled={isLoading || isLoadingStatus}
                  className="w-full bg-[var(--color-bg-secondary-20)] backdrop-blur-sm hover:bg-[var(--color-bg-secondary-30)] disabled:bg-[var(--color-bg-secondary-20)] text-[var(--color-text-white)] font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-3"
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
              </div>
            </div>

            {/* Quick Status Cards */}
            <div className="bg-[var(--color-bg-card)] rounded-xl shadow-sm p-6 border border-[var(--color-border-primary)]">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Quick status</h3>

              <div className="grid grid-cols-2 gap-4">

                {/* Projects */}
                <div
                  onClick={() => navigate("/projects")}
                  className="bg-gradient-to-br from-[var(--color-blue-lightest)] to-[var(--color-blue-lighter)] rounded-xl p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-[var(--color-blue-lighter)] rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-4 h-4 text-[var(--color-blue-dark)]" />
                    </div>
                    <span className="font-semibold text-[var(--color-text-primary)]">Project</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">View active projects</p>
                </div>

                {/* Leave */}
                <div
                  onClick={() => navigate("/leave-application")}
                  className="bg-gradient-to-br from-[var(--color-warning-light)] to-[var(--color-yellow-light)] rounded-xl p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-[var(--color-yellow-light)] rounded-lg flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-[var(--color-warning-dark)]" />
                    </div>
                    <span className="font-semibold text-[var(--color-text-primary)]">Leave</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">Request time off</p>
                  <div className="mt-2 text-xs text-[var(--color-warning-dark)] font-medium">--</div>
                </div>

                {/* Breaks */}
                <div
                  onClick={() => navigate("/breaks")}
                  className="bg-gradient-to-br from-[var(--color-icon-blue-bg)] to-[var(--color-blue-lighter)] rounded-xl p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-[var(--color-blue-lighter)] rounded-lg flex items-center justify-center">
                      <Coffee className="w-4 h-4 text-[var(--color-blue-dark)]" />
                    </div>
                    <span className="font-semibold text-[var(--color-text-primary)]">Breaks</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">Track break time</p>
                </div>

                {/* Meeting */}
                <div
                  onClick={() => navigate("/meetings")}
                  className="bg-gradient-to-br from-[var(--color-success-light)] to-[var(--color-success-lighter)] rounded-xl p-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-[var(--color-success-lighter)] rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-[var(--color-success-dark)]" />
                    </div>
                    <span className="font-semibold text-[var(--color-text-primary)]">Meeting</span>
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">Scheduled meetings</p>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column - Calendar & Leave Stats */}
          <div className="lg:col-span-3 space-y-6">

            {/* Calendar */}
            <div className="bg-[var(--color-bg-card)] rounded-xl shadow-sm p-6 border border-[var(--color-border-primary)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Calendar</h3>
                <Maximize2 className="w-4 h-4 text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text-secondary)]" />
              </div>

              <div className="text-center mb-4">
                <div className="text-xl font-bold text-[var(--color-text-primary)]">{getMonthName()}</div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs text-[var(--color-text-secondary)] text-center p-1 font-medium">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {generateCalendar()}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border-divider)]">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[var(--color-blue)] rounded-full"></div>
                  <span className="text-xs text-[var(--color-text-secondary)]">Present</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[var(--color-text-muted)] rounded-full"></div>
                  <span className="text-xs text-[var(--color-text-secondary)]">Absent</span>
                </div>
              </div>
            </div>

            {/* Leave Stats */}
            <div className="bg-[var(--color-bg-card)] rounded-xl shadow-sm p-6 border border-[var(--color-border-primary)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Leave stats</h3>
                <Maximize2 className="w-4 h-4 text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text-secondary)]" />
              </div>

              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="45"
                      stroke="var(--color-bg-gray-light)"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="45"
                      stroke="var(--color-blue)"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${(16 / 20) * 283} 283`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[var(--color-text-primary)]">16</div>
                      <div className="text-xs text-[var(--color-text-secondary)]">Days</div>
                    </div>
                  </div>
                </div>

                <div className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">16/20</div>

                <button className="w-full bg-[var(--color-blue)] text-[var(--color-text-white)] py-2 px-4 rounded-lg text-sm font-medium hover:bg-[var(--color-blue-dark)] transition-colors">
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