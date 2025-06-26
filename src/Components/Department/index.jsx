import React, { useState } from "react";
import { RefreshCw, AlertCircle, CheckCircle, XCircle, X } from "lucide-react";
import DepartmentForm from "./DepartmentForm";
import DepartmentList from "./DepartmentList";
import useDepartments from "../../hooks/useDepartments";

const Toast = ({ message, type, onClose }) => {
    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-blue-600" />;
        }
    };

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg transition-all duration-300 ${getToastStyles()}`}>
            <div className="flex items-center space-x-3">
                {getIcon()}
                <span className="font-medium">{message}</span>
                <button
                    onClick={onClose}
                    className="ml-auto p-1 hover:bg-black hover:bg-opacity-10 rounded"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const Department = () => {
    const {
        departments,
        loading,
        addDepartment,
        deleteDepartment,
    } = useDepartments();

    const [toast, setToast] = useState(null);

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const handleAddDepartment = async (name) => {
        const result = await addDepartment(name);
        return result;
    };

    const handleDeleteDepartment = async (id) => {
        const result = await deleteDepartment(id);
        return result;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 pb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Department Management
                        </h1>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    <DepartmentForm
                        onSubmit={handleAddDepartment}
                        loading={loading}
                        showToast={showToast}
                    />

                    <DepartmentList
                        departments={departments}
                        onDelete={handleDeleteDepartment}
                        loading={loading}
                        showToast={showToast}
                    />
                </div>

                {/* Toast Notification */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default Department;