import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import useUserId from "./useUserId";

const useDepartments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const user_id = useUserId();

    const fetchDepartments = async () => {
        if (!user_id) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('user_id', user_id);

            const res = await api.post("/department_list", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            const departmentData = res.data.data || res.data || [];
            setDepartments(Array.isArray(departmentData) ? departmentData : []);
        } catch (err) {
            console.error("Error fetching departments:", err);
            setError("Failed to fetch departments");
            setDepartments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user_id) {
            fetchDepartments();
        }
    }, [user_id]);

    const addDepartment = async (name) => {
        if (!name.trim()) return { success: false, message: "Department name is required" };

        try {
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('user_id', user_id);

            const res = await api.post("/department_create", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            // Check if the API response indicates success or failure
            if (res.data && res.data.success === false) {
                // API returned success: false - handle the error
                const errorMessage = res.data.message || "Failed to add department";
                setError(errorMessage);
                return { success: false, message: errorMessage };
            }

            // Check for other possible error indicators in the response
            if (res.data && res.data.error) {
                const errorMessage = res.data.error;
                setError(errorMessage);
                return { success: false, message: errorMessage };
            }

            // If we get here, assume success and refresh the departments list
            await fetchDepartments();
            return { success: true };
        } catch (err) {
            console.error("Error adding department:", err);

            // Handle different types of errors
            let errorMessage = "Failed to add department";

            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    const deleteDepartment = async (id) => {
        if (!id) {
            return { success: false, error: "No ID provided" };
        }

        try {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('user_id', user_id);
            formData.append('department_id', id);

            const res = await api.post("/department_delete", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (res.data && res.data.success === false) {
                setError(`Delete failed: ${res.data.message}`);
                return { success: false, error: res.data.message };
            }

            await fetchDepartments();
            return { success: true };
        } catch (err) {
            console.error("Error deleting department:", err);
            const errorMessage = err.response?.data?.message || err.message || "Unknown error";
            setError(`Failed to delete department: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    };

    return {
        departments,
        loading,
        error,
        addDepartment,
        deleteDepartment,
        refetchDepartments: fetchDepartments
    };
};

export default useDepartments;