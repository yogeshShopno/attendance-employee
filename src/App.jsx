import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import { ThemeProvider } from './context/Themecontext';
import Login from "./Components/Login";
import AttendanceDashboard from './Components/AttendanceDashboard';
import EmployeeProfile from './pages/EmployeeProfile';
import Attendance from './pages/Attendance';
import LeaveApplication from './pages/leaveapplication';
import { useState, useEffect } from 'react';

const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";
  const isUnauthorizedPage = location.pathname === "/unauthorized";
  const shouldHideNavigation = isLoginPage || isUnauthorizedPage;

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(true);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getMainContentStyle = () => {
    if (shouldHideNavigation) return { paddingTop: '0' };

    const baseStyle = {
      paddingTop: '4rem',
      transition: 'margin-left 0.3s ease-in-out'
    };

    if (isMobile) {
      return { ...baseStyle, marginLeft: '0' };
    } else {
      return { ...baseStyle, marginLeft: isCollapsed ? '5rem' : '16rem' };
    }
  };

  return (
    <ThemeProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-bg-primary)]">
        {!shouldHideNavigation && <Navbar />}

        <div className="flex flex-1 relative">
          {!shouldHideNavigation && (
            <Sidebar
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
            />
          )}

          <main
            className="flex-1 overflow-y-auto bg-[var(--color-bg-primary)]"
            style={getMainContentStyle()}
          >
            <div className="min-h-full w-full">
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<AttendanceDashboard />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/employee" element={<EmployeeProfile />} />
                <Route path="/leave-application" element={<LeaveApplication />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;
