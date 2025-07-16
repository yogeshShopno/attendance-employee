import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Phone, CreditCard, CheckCircle, LogOut } from 'lucide-react';

const EmployeeProfile = () => {
    const { user, logout, isAuthenticated } = useAuth();

    if (!isAuthenticated()) {
        return (
            <div className="max-w-md mx-auto mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700">
                    <span className="text-sm font-medium">Please login to view employee profile</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Employee Profile</h2>
                <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>

            {/* Login Status */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle size={20} />
                    <span className="font-medium">Successfully logged in</span>
                </div>
            </div>

            {/* Employee Information */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Full Name</label>
                            <p className="text-lg font-semibold text-gray-800">{user?.full_name || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Phone className="text-green-600" size={24} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Phone Number</label>
                            <p className="text-lg font-semibold text-gray-800">{user?.number || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Employee ID */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <CreditCard className="text-purple-600" size={24} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">Employee ID</label>
                            <p className="text-lg font-semibold text-gray-800">{user?.employee_id || 'N/A'}</p>
                        </div>
                    </div>

                    {/* User ID */}
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <CreditCard className="text-orange-600" size={24} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">User ID</label>
                            <p className="text-lg font-semibold text-gray-800">{user?.user_id || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;