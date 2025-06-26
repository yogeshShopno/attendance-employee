// src/components/Login.jsx
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import api from '../api/axiosInstance';

// import redux from;


const Login = () => {
    const [number, setNumber] = useState("7412589633");
    const [password, setPassword] = useState("123456");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();


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
                console.log(res.data.data);

            navigate("/home");

        } catch (error) {
            if (error.response?.status === 401) {
                setError("Invalid credentials. Please try again.");
            } else if (error.response?.status >= 500) {
                setError("Server error. Please try again later.");
            } else {
                setError("Login failed. Please check your internet connection.");
            }
        } finally {
            setIsLoading(false);
        }
    };




    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;