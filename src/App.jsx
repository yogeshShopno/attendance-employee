import { Route, Routes, useLocation, } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import Login from "./Components/Login";
import Home from './Components/Home';
import LeaveApplication from './pages/leaveapplication';




const App = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";
  const isUnauthorizedPage = location.pathname === "/unauthorized";
  const shouldHideNavigation = isLoginPage || isUnauthorizedPage;



  return (
    <div className="flex flex-col h-screen">
      {!shouldHideNavigation && <Navbar />}
      <div className={`flex flex-1 ${!shouldHideNavigation ? "ml-64 pt-16" : ""}`}>
        {!shouldHideNavigation && <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/applyLeave" element={<LeaveApplication />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;