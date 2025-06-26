import React, { useState } from "react";
import { Plus, Building2 } from "lucide-react";

const BranchForm = ({ onSubmit, loading = false, showToast }) => {
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            showToast("Please enter a branch name", "error");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await onSubmit(name.trim());

            // Handle the response based on the success property
            if (result && Object.prototype.hasOwnProperty.call(result, 'success')) {
                if (result.success === true) {
                    // Success case
                    setName("");
                    showToast("Branch added successfully!", "success");
                } else {
                    // success: false case - show the specific error message
                    const errorMessage = result.message || "Failed to add branch. Please try again.";
                    showToast(errorMessage, "error");
                }
            } else {
                // Handle case where result doesn't have success property or is null/undefined
                showToast("Failed to add branch. Please try again.", "error");
            }
        } catch (error) {
            // Handle network errors or other exceptions
            console.error("Error adding branch:", error);
            showToast("An error occurred while adding the branch.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Add New Branch
                        </h3>
                        <p className="text-sm text-gray-600">
                            Create a new branch for your organization
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="branchName" className="block text-sm font-medium text-gray-700 mb-2">
                            Branch Name
                        </label>
                        <input
                            id="branchName"
                            type="text"
                            placeholder="Enter branch name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                            disabled={isSubmitting || loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || loading || !name.trim()}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Adding...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Add Branch
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BranchForm;