import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import Login from "./Components/Login";
import Home from './Components/Home';
import ProtectedRoute from './Components/ProtectedRoute';
// import api from "./api";
import Employee from './pages/Employee/Employee';
import EmployeeDetail from './pages/Employee/EmployeeDetail';
import AddEmployee from './pages/Employee/AddEmployee';
import LeaveApplication from './pages/Leave/LeaveApplication';
import LeaveStatusPage from './pages/Leave/LeaveStatus';
// import HolidayCalendar from './pages/Leave/HolidayCalendar';   
import DepartmentsPage from './pages/Employee/Departments';
import BranchesPage from './pages/Employee/Branches';
import DesignationPage from './pages/Employee/Designations';
import Role from './pages/Users/Role';
import AddRole from './pages/Users/AddRole';
import Usermanagement from './pages/Users/Usermanagement';
import AddUser from './pages/Users/AddUser';
import ShiftManagement from './pages/ShiftManagement/ShiftManagement';
import CreateShift from './pages/ShiftManagement/CreateShift';
import AssignShift from './pages/ShiftManagement/AssignShift';
import Unauthorized from './Components/Unauthorized';
// import BulkAttendance from './pages/Payroll/BulkAttendance';
// import MonthlyPayroll from './pages/Payroll/MonthlyPayroll';
// import HourlyPayroll from './pages/Payroll/HourlyPayroll';
// import FinalizePayroll from './pages/Payroll/FinalizePayroll';
import { useSelector } from 'react-redux';
import LoanAdvance from './pages/Loan/LoanAdvance';
import AddLoanAdvance from './pages/Loan/AddLoanAdvance';


const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";
  const isUnauthorizedPage = location.pathname === "/unauthorized";
  const shouldHideNavigation = isLoginPage || isUnauthorizedPage;
  const permissions = useSelector(state => state.permissions) || {};

  // useEffect(() => {
  //   api.get("/api/data")
  //     .then((res) => {
  //       console.log("Data:", res.data);
  //     })
  //     .catch((err) => {
  //       console.error("Error:", err);
  //     });
  // }, []);

  return (
    <div className="flex flex-col h-screen">
      {!shouldHideNavigation && <Navbar />}
      <div className={`flex flex-1 ${!shouldHideNavigation ? "ml-64 pt-16" : ""}`}>
        {!shouldHideNavigation && <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/usermanage" element={<Usermanagement />} />
            {permissions['user_create'] ? (
              <Route path="/add-user" element={<AddUser />} />
            ) : (
              <Route path="/add-user" element={<Navigate to="/unauthorized" replace />} />
            )}

            <Route path="/role" element={<Role />} />

            {(permissions['user_roles_create'] || permissions['user_roles_edit']) ? (
              <Route path="/add-role" element={<AddRole />} />
            ) : (
              <Route path="/add-role" element={<Navigate to="/unauthorized" replace />} />
            )}

            <Route path="/employee" element={<Employee />} />
            <Route path="/add-employee" element={<AddEmployee />} />
            <Route path="/employee/details/:employee_id" element={<EmployeeDetail />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/branches" element={<BranchesPage />} />
            <Route path="/designation" element={<DesignationPage />} />
            <Route path="/shift-management" element={<ShiftManagement />} />
            <Route path="/add-shift" element={<CreateShift />} />
            <Route path="/assign-shift" element={<AssignShift />} />
            <Route path="/leaveapplication" element={<LeaveApplication />} />
            <Route path="/leavestatusPage" element={<LeaveStatusPage />} />
            <Route path="/loans" element={<LoanAdvance />} />
            <Route path="/add-loan-advance" element={<AddLoanAdvance />} />
            {/* <Route path="/holidaycalender" element={<HolidayCalendar />} />
            <Route path="/bulk-attendance" element={<BulkAttendance />} />
            <Route path="/monthly-payroll" element={<MonthlyPayroll />} />
            <Route path="/hourly-payroll" element={<HourlyPayroll />} />
            <Route path="/finalize-payroll" element={<FinalizePayroll />} /> */}

            <Route path="*" element={<Navigate to="/unauthorized" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;