import React, { useState, useEffect } from 'react';
import { Clock, LogOut, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
const attendanceData = [
  { date: '02-06-2025', clockIn: '09:17:18', clockOut: '18:31:19', totalHr: '09 hr 14 min' },
  { date: '03-06-2025', clockIn: '09:19:05', clockOut: '20:16:34', totalHr: '10 hr 57 min' },
  { date: '04-06-2025', clockIn: '09:25:57', clockOut: '19:26:13', totalHr: '10 hr 00 min' },
  { date: '05-06-2025', clockIn: '09:24:53', clockOut: '18:36:53', totalHr: '09 hr 12 min' },
  { date: '06-06-2025', clockIn: '07:52:31', clockOut: '20:08:48', totalHr: '12 hr 16 min' },
  { date: '07-06-2025', clockIn: '17:49:58', clockOut: '18:30:00', totalHr: '00 hr 40 min' },
  { date: '08-06-2025', clockIn: '20:51:47', clockOut: '22:23:48', totalHr: '01 hr 32 min' },
  { date: '09-06-2025', clockIn: '00:00:34', clockOut: '20:16:50', totalHr: '20 hr 16 min' },
  { date: '10-06-2025', clockIn: '11:59:56', clockOut: '18:30:00', totalHr: '06 hr 30 min' },
  { date: '11-06-2025', clockIn: '01:53:08', clockOut: '21:46:54', totalHr: '19 hr 53 min' },
  { date: '12-06-2025', clockIn: '10:09:32', clockOut: '19:19:58', totalHr: '09 hr 10 min' },
  { date: '13-06-2025', clockIn: '09:23:03', clockOut: '18:57:08', totalHr: '09 hr 34 min' },
  { date: '14-06-2025', clockIn: '09:30:54', clockOut: '18:33:19', totalHr: '09 hr 02 min' },
  { date: '16-06-2025', clockIn: '09:24:00', clockOut: '18:31:31', totalHr: '09 hr 07 min' },
];

const Home = () => {
  const endTime = "6:30 PM";
  const remainingTime = "7 hrs 26 min";
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClockInOut = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("user_id", 1); // Replace with actual user_id
    formData.append("employee_id", 1); // Replace with actual employee_id

    try {
      const res = await api.post("emp_clock_in_and_clock_out", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/home");
    } catch (error) {
      setError("Clock in/out failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] p-6 text-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">👋 hello Yogesh, Have a nice day!</h2>
          <div className="text-blue-400 font-semibold mt-1">Your End Time : {endTime}</div>
          <div className="mt-1">Time remaining until end : {remainingTime}</div>
        </div>
        <div>
          <button
            onClick={handleClockInOut}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            {isLoading ? "Processing..." : "Clock In/Out"}
          </button>
        </div>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      <div className="overflow-x-auto mt-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-300">
              <th className="p-3 border-b">No</th>
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b">Clock In</th>
              <th className="p-3 border-b">Clock Out</th>
              <th className="p-3 border-b">Total Hr</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((entry, index) => (
              <tr key={index} className="even:bg-[#1f2937] hover:bg-[#374151]">
                <td className="p-3 border-b">{index + 1}</td>
                <td className="p-3 border-b">{entry.date}</td>
                <td className="p-3 border-b">{entry.clockIn}</td>
                <td className="p-3 border-b">{entry.clockOut}</td>
                <td className="p-3 border-b">{entry.totalHr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;