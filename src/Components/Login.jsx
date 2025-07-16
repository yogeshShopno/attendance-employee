// src/components/Login.jsx
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { Toast } from './Toast';
import api from '../api/axiosInstance';

const Login = () => {
    const [number, setNumber] = useState("7412589633");
    const [password, setPassword] = useState("123456");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);

    const navigate = useNavigate();
    const { login } = useAuth();

    // Toast helper function
    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (!number || !password) {
            setError("Please enter both phone number and password");
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("number", number);
        formData.append("password", password);

        try {
            const res = await api.post("emp_login", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            console.log("Login response:", res.data); // Debug log

            // Fixed: Check for success property instead of status
            if (res?.data?.success === true && res?.data?.employee_data) {
                // Show success toast
                showToast("Login successful! Redirecting...", "success");

                // Pass the response data directly to login function
                const loginSuccess = login(res.data);

                if (loginSuccess) {
                    // Small delay to show success message before navigation
                    setTimeout(() => {
                        navigate("/home");
                    }, 1500);
                } else {
                    showToast("Failed to process login. Please try again.", "error");
                }
            } else {
                // Handle various error scenarios
                const errorMessage = res?.data?.message || "Login failed. Please check your credentials.";
                showToast(errorMessage, "error");
                setError(errorMessage);
            }

        } catch (error) {
            console.error("Login error:", error);

            let errorMessage = "Login failed. Please try again.";

            // Handle different error types
            if (error.response?.status === 401) {
                errorMessage = "Invalid credentials. Please try again.";
            } else if (error.response?.status === 422) {
                errorMessage = "Invalid input. Please check your phone number and password.";
            } else if (error.response?.status >= 500) {
                errorMessage = "Server error. Please try again later.";
            } else if (error.code === 'NETWORK_ERROR') {
                errorMessage = "Network error. Please check your internet connection.";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            showToast(errorMessage, "error");
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="w-full max-w-md">
                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-8 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-800 rounded-full"></div>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-slate-300 text-sm">Sign in to continue to your account</p>
                    </div>

                    {/* Content */}
                    <div className="px-8 py-8">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Phone Number Input */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Enter your number"
                                        className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:border-slate-600 focus:outline-none transition-all duration-200 text-slate-700 placeholder-slate-400"
                                        value={number}
                                        onChange={(e) => setNumber(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="w-full pl-12 pr-12 py-4 border-2 border-slate-200 rounded-xl focus:border-slate-600 focus:outline-none transition-all duration-200 text-slate-700 placeholder-slate-400"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password */}
                            <div className="text-right">
                                <button
                                    type="button"
                                    className="text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
                                    onClick={() => {
                                        showToast("Forgot password functionality not implemented yet.", "info");
                                    }}
                                >
                                    Forgot your password?
                                </button>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-slate-800 to-slate-700 text-white py-4 rounded-xl font-semibold hover:from-slate-900 hover:to-slate-800 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Signing in...
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                        {/* Additional Info */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-slate-500">
                                Don't have an account?{" "}
                                <button
                                    type="button"
                                    className="text-slate-600 hover:text-slate-800 font-medium"
                                    onClick={() => {
                                        showToast("Registration functionality not implemented yet.", "info");
                                    }}
                                >
                                    Contact administrator
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;