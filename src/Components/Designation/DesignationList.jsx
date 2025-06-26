import React, { useState, useMemo } from "react";
import { Trash2, Briefcase, AlertTriangle, X, Search } from "lucide-react";

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger", isLoading = false }) => {
    if (!isOpen) return null;

    const getButtonStyles = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 text-white';
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700 text-white';
            default:
                return 'bg-purple-600 hover:bg-purple-700 text-white';
        }
    };

    const getIconAndStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
                    iconBg: 'bg-red-100'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
                    iconBg: 'bg-yellow-100'
                };
            default:
                return {
                    icon: <AlertTriangle className="w-6 h-6 text-purple-600" />,
                    iconBg: 'bg-purple-100'
                };
        }
    };

    const { icon, iconBg } = getIconAndStyles();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className={`p-2 ${iconBg} rounded-lg`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {title}
                            </h3>
                            <p className="text-sm text-gray-600">
                                This action cannot be undone
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-700 mb-6">
                        {message}
                    </p>

                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-4 py-2 ${getButtonStyles()} rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Loading...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DesignationList = ({ designations, onDelete, loading = false, showToast }) => {
    const [deletingId, setDeletingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: null,
        data: null
    });

    // Real-time search filtering using useMemo for performance
    const filteredDesignations = useMemo(() => {
        if (!designations || !searchTerm.trim()) {
            return designations || [];
        }

        return designations.filter(designation =>
            designation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (designation.description && designation.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (designation.level && designation.level.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (designation.department && designation.department.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [designations, searchTerm]);

    const handleDeleteClick = (designation) => {
        setConfirmModal({
            isOpen: true,
            type: 'delete',
            data: designation
        });
    };

    const confirmDeleteDesignation = async () => {
        const designation = confirmModal.data;
        if (!designation) return;

        const designationId = designation.designation_id || designation.id;
        setDeletingId(designationId);

        try {
            const result = await onDelete(designationId);

            if (result && !result.success) {
                showToast("Failed to delete designation. Please try again.", "error");
            } else {
                showToast("Designation deleted successfully!", "success");
            }
        } catch (error) {
            showToast("An error occurred while deleting the designation.", error);
        } finally {
            setDeletingId(null);
            closeModal();
        }
    };

    const closeModal = () => {
        if (!deletingId) {
            setConfirmModal({ isOpen: false, type: null, data: null });
        }
    };

    const clearSearch = () => {
        setSearchTerm("");
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <Briefcase className="w-5 h-5 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Designations
                        </h3>
                    </div>
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600">Loading designations...</span>
                </div>
            </div>
        );
    }

    const totalDesignations = designations ? designations.length : 0;
    const filteredCount = filteredDesignations.length;

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                                <Briefcase className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Designations ({totalDesignations})
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Manage your organization's designations
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                {totalDesignations > 0 && (
                    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search designations by name ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 bg-white"
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 text-gray-400 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="p-6">
                    {totalDesignations === 0 ? (
                        <div className="text-center py-12">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Briefcase className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                No designations found
                            </h4>
                            <p className="text-gray-500 mb-1">
                                Get started by adding your first designation
                            </p>
                            <p className="text-sm text-gray-400">
                                Use the form above to create a new designation
                            </p>
                        </div>
                    ) : filteredCount === 0 ? (
                        <div className="text-center py-12">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                No designations match your search
                            </h4>
                            <p className="text-gray-500 mb-4">
                                Try adjusting your search terms or
                            </p>
                            <button
                                onClick={clearSearch}
                                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Clear Search
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredDesignations.map((designation) => {
                                const designationId = designation.designation_id || designation.id;
                                const isDeleting = deletingId === designationId;

                                return (
                                    <div
                                        key={designationId}
                                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all duration-200 bg-gradient-to-r from-purple-50/30 to-indigo-50/30 hover:from-purple-50/50 hover:to-indigo-50/50"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                                                        {designation.name}
                                                    </h4>
                                                </div>

                                                {designation.description && (
                                                    <p className="text-gray-600 mb-2 text-sm leading-relaxed">
                                                        {designation.description}
                                                    </p>
                                                )}

                                                {designation.level && (
                                                    <p className="text-gray-600 mb-1 text-sm">
                                                        <span className="font-medium">Level:</span> {designation.level}
                                                    </p>
                                                )}

                                                {designation.department && (
                                                    <p className="text-gray-600 mb-2 text-sm">
                                                        <span className="font-medium">Department:</span> {designation.department}
                                                    </p>
                                                )}

                                                {designationId && (
                                                    <p className="text-xs text-gray-400 font-mono">
                                                        ID: {designationId}
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleDeleteClick(designation)}
                                                disabled={isDeleting}
                                                className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                                title="Delete designation"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen && confirmModal.type === 'delete'}
                onClose={closeModal}
                onConfirm={confirmDeleteDesignation}
                title="Delete Designation"
                message={`Are you sure you want to delete "${confirmModal.data?.name || 'this designation'}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                isLoading={deletingId !== null}
            />
        </>
    );
};

export default DesignationList;