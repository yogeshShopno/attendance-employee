import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, X, Calendar, User, DollarSign, Percent, Clock, FileText, CheckCircle, Users, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance'; // Adjust path as needed

// Toast Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5" />;
            case 'error':
                return <AlertCircle className="w-5 h-5" />;
            case 'info':
                return <Info className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-md ${getToastStyles()}`}>
            <div className="flex items-start gap-3">
                {getIcon()}
                <div className="flex-1">
                    <p className="font-medium">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const AddLoanAdvance = ({
    existingLoan = null,
}) => {
    const [formData, setFormData] = useState({
        employeeName: '',
        employeeId: '',
        loanType: '',
        loanTypeId: '',
        amount: '',
        interestRate: '',
        tenure: '',
        reason: '',
        approvalStatus: '',
        approvalStatusId: '',
        disbursementDate: '',
        repaymentStartDate: '',
        installmentAmount: '',
        guarantorName: '',
        guarantorContact: '',
        documents: [],
        priority: '',
        priorityId: ''
    });

    const navigate = useNavigate();

    // State for dropdown data
    const [employees, setEmployees] = useState([]);
    const [loanTypes, setLoanTypes] = useState([]);
    const [priorities, setPriorities] = useState([]);
    const [statuses, setStatuses] = useState([]);

    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    // Toast function
    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    const hideToast = () => {
        setToast(null);
    };

    // Fetch employee dropdown data
    const fetchEmployeeData = async () => {
        try {
            if (!user?.user_id) {
                return;
            }

            const formData = new FormData();
            formData.append('user_id', user.user_id);

            const response = await api.post('assign_shift_list_drop_down', formData);

            if (response.data.success) {
                setEmployees(response.data.data.employee_list || []);
            } else {
                showToast(response.data.message || 'Failed to fetch employee data', 'error');
            }
        } catch (err) {
            console.error('Error fetching employee data:', err);
            showToast('Failed to load employee data. Please try again.', 'error');
        }
    };

    // Fetch loan dropdown data
    const fetchLoanDropdownData = async () => {
        try {
            if (!user?.user_id) {
                return;
            }

            const formDataObj = new FormData();
            formDataObj.append('user_id', user.user_id);

            const response = await api.post('loan_drop_down_list', formDataObj);

            if (response.data.success) {
                const data = response.data.data;
                setLoanTypes(data.loan_type_list || []);
                setPriorities(data.loan_priority_list || []);
                setStatuses(data.loan_status_list || []);

                // Set default values

            } else {
                showToast(response.data.message || 'Failed to fetch loan dropdown data', 'error');
            }
        } catch (err) {
            console.error('Error fetching loan dropdown data:', err);
            showToast('Failed to load dropdown data. Please try again.', 'error');
        }
    };

    // Fetch all dropdown data
    const fetchDropdownData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchEmployeeData(),
                fetchLoanDropdownData()
            ]);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (api && user) {
            fetchDropdownData();
        }
    }, [user, api]);


    // Pre-fill form if editing existing loan
    useEffect(() => {
        if (existingLoan && loanTypes.length > 0 && priorities.length > 0 && statuses.length > 0) {
            // Find matching dropdown items
            const matchingLoanType = loanTypes.find(lt => lt.name === existingLoan.loanType);
            const matchingPriority = priorities.find(p => p.name === existingLoan.priority);
            const matchingStatus = statuses.find(s => s.name === existingLoan.approvalStatus);

            setFormData({
                employeeName: existingLoan.employeeName || '',
                employeeId: existingLoan.employeeId || '',
                loanType: existingLoan.loanType || '',
                loanTypeId: matchingLoanType?.loan_type_id || '',
                amount: existingLoan.totalAmount?.toString() || '',
                interestRate: existingLoan.interestRate?.toString() || '',
                tenure: existingLoan.tenure?.toString() || '',
                reason: existingLoan.reason || '',
                approvalStatus: existingLoan.approvalStatus || '',
                approvalStatusId: matchingStatus?.status_id || '',
                disbursementDate: existingLoan.disbursementDate || '',
                repaymentStartDate: existingLoan.repaymentStartDate || '',
                installmentAmount: existingLoan.installmentAmount?.toString() || '',
                guarantorName: existingLoan.guarantorName || '',
                guarantorContact: existingLoan.guarantorContact || '',
                documents: existingLoan.documents || [],
                priority: existingLoan.priority || '',
                priorityId: matchingPriority?.loan_priority_id || ''
            });

            // Set selected employee if editing
            if (existingLoan.employeeId) {
                setSelectedEmployee(existingLoan.employeeId);
            }
        }
    }, [existingLoan, loanTypes, priorities, statuses]);

    // Handle employee selection
    const handleEmployeeSelect = (e) => {
        const employeeId = e.target.value;
        setSelectedEmployee(employeeId);

        if (employeeId) {
            const selectedEmp = employees.find(emp => emp.employee_id === employeeId);
            if (selectedEmp) {
                setFormData(prev => ({
                    ...prev,
                    employeeName: selectedEmp.full_name,
                    employeeId: selectedEmp.employee_id
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                employeeName: '',
                employeeId: ''
            }));
        }

        // Clear error when user selects an employee
        if (errors.employeeName) {
            setErrors(prev => ({
                ...prev,
                employeeName: ''
            }));
        }
    };

    // Handle loan type selection
    const handleLoanTypeSelect = (e) => {
        const loanTypeId = e.target.value;
        const selectedLoanType = loanTypes.find(lt => lt.loan_type_id === loanTypeId);

        if (selectedLoanType) {
            setFormData(prev => ({
                ...prev,
                loanType: selectedLoanType.name,
                loanTypeId: selectedLoanType.loan_type_id
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                loanType: '',
                loanTypeId: ''
            }));
        }
    };

    // Handle priority selection
    const handlePrioritySelect = (e) => {
        const priorityId = e.target.value;
        const selectedPriority = priorities.find(p => p.loan_priority_id === priorityId);

        if (selectedPriority) {
            setFormData(prev => ({
                ...prev,
                priority: selectedPriority.name,
                priorityId: selectedPriority.loan_priority_id
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                priority: '',
                priorityId: ''
            }));
        }
    };

    // Handle status selection
    const handleStatusSelect = (e) => {
        const statusId = e.target.value;
        const selectedStatus = statuses.find(s => s.status_id === statusId);

        if (selectedStatus) {
            setFormData(prev => ({
                ...prev,
                approvalStatus: selectedStatus.name,
                approvalStatusId: selectedStatus.status_id
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                approvalStatus: '',
                approvalStatusId: ''
            }));
        }
    };

    // Calculate installment amount when amount, interest rate, or tenure changes
    useEffect(() => {
        if (formData.amount && formData.interestRate && formData.tenure) {
            const principal = parseFloat(formData.amount);
            const rate = parseFloat(formData.interestRate) / 100 / 12; // Monthly rate
            const months = parseInt(formData.tenure);

            if (rate > 0) {
                const installment = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
                setFormData(prev => ({
                    ...prev,
                    installmentAmount: installment.toFixed(2)
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    installmentAmount: (principal / months).toFixed(2)
                }));
            }
        }
    }, [formData.amount, formData.interestRate, formData.tenure]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleBack = () => {
        navigate('/loans');
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.employeeName.trim() || !formData.employeeId) {
            newErrors.employeeName = 'Employee selection is required';
        }

        if (!formData.loanType.trim() || !formData.loanTypeId) {
            newErrors.loanType = 'Loan type is required';
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Valid amount is required';
        }

        if (formData.loanType === 'Loan') {
            if (!formData.interestRate || parseFloat(formData.interestRate) < 0) {
                newErrors.interestRate = 'Interest rate is required for loans';
            }

            if (!formData.tenure || parseInt(formData.tenure) <= 0) {
                newErrors.tenure = 'Tenure is required for loans';
            }
        }

        if (!formData.reason.trim()) {
            newErrors.reason = 'Reason is required';
        }

        if (!formData.priority.trim() || !formData.priorityId) {
            newErrors.priority = 'Priority is required';
        }

        if (!formData.approvalStatus.trim() || !formData.approvalStatusId) {
            newErrors.approvalStatus = 'Approval status is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showToast('Please fix the validation errors before submitting', 'error');
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare FormData for API
            const apiFormData = new FormData();
            apiFormData.append('user_id', user.user_id);
            apiFormData.append('employee_id', formData.employeeId);
            apiFormData.append('loan_type_id', formData.loanTypeId);
            apiFormData.append('loan_priority_id', formData.priorityId);
            apiFormData.append('amount', formData.amount);
            apiFormData.append('interest_rate', formData.interestRate || '0');
            apiFormData.append('tenure', formData.tenure || '0');
            apiFormData.append('installment_amount', formData.installmentAmount || '0');
            apiFormData.append('status', formData.approvalStatusId);

            // Format dates to DD-MM-YYYY if they exist
            if (formData.disbursementDate) {
                const disbursementFormatted = formatDateForAPI(formData.disbursementDate);
                apiFormData.append('disbursement_date', disbursementFormatted);
            }

            if (formData.repaymentStartDate) {
                const repaymentFormatted = formatDateForAPI(formData.repaymentStartDate);
                apiFormData.append('repayment_start_date', repaymentFormatted);
            }

            apiFormData.append('guarantor_name', formData.guarantorName || '');
            apiFormData.append('guarantor_contact', formData.guarantorContact || '');
            apiFormData.append('reason', formData.reason);

            // Call API
            const response = await api.post('add_loan', apiFormData);

            if (response.data.success) {
                showToast('Loan/Advance created successfully!', 'success');

                // Navigate back after a short delay
                setTimeout(() => {
                    navigate('/loans');
                }, 1500);
            } else {
                showToast(response.data.message || 'Failed to create loan/advance', 'error');
            }

        } catch (error) {
            console.error('Error creating loan:', error);
            showToast('Failed to create loan/advance. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Add this helper function near the top of your component (after the showToast function):

    const formatDateForAPI = (dateString) => {
        if (!dateString) return '';

        // Convert YYYY-MM-DD to DD-MM-YYYY
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    };

    const handleReset = () => {
        // Reset form with default dropdown values
        const defaultLoanType = loanTypes.length > 0 ? loanTypes[0] : null;
        const normalPriority = priorities.find(p => p.name === 'Normal');
        const pendingStatus = statuses.find(s => s.name === 'Pending');

        setFormData({
            employeeName: '',
            employeeId: '',
            loanType: defaultLoanType?.name || '',
            loanTypeId: defaultLoanType?.loan_type_id || '',
            amount: '',
            interestRate: '',
            tenure: '',
            reason: '',
            approvalStatus: pendingStatus?.name || '',
            approvalStatusId: pendingStatus?.status_id || '',
            disbursementDate: '',
            repaymentStartDate: '',
            installmentAmount: '',
            guarantorName: '',
            guarantorContact: '',
            documents: [],
            priority: normalPriority?.name || '',
            priorityId: normalPriority?.loan_priority_id || ''
        });
        setSelectedEmployee('');
        setErrors({});
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Go Back"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    {existingLoan ? 'Edit Loan/Advance' : 'Add New Loan/Advance'}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {existingLoan ? 'Update existing loan/advance details' : 'Fill in the details to create a new loan/advance'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <X size={16} className="inline mr-1" />
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-6">
                        <div className="space-y-8">
                            {/* Employee Information */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <User size={20} className="text-blue-600" />
                                    Employee Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <Users className="w-4 h-4 inline mr-2" />
                                            Select Employee *
                                        </label>
                                        <select
                                            value={selectedEmployee}
                                            onChange={handleEmployeeSelect}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.employeeName ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            disabled={loading}
                                        >
                                            <option value="">
                                                {loading ? 'Loading employees...' : 'Choose an employee...'}
                                            </option>
                                            {employees.map((employee) => (
                                                <option key={employee.employee_id} value={employee.employee_id}>
                                                    {employee.full_name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.employeeName && (
                                            <p className="text-red-500 text-xs mt-1">{errors.employeeName}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Loan Details */}
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <DollarSign size={20} className="text-green-600" />
                                    Loan/Advance Details
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Type *
                                        </label>
                                        <select
                                            value={formData.loanTypeId}
                                            onChange={handleLoanTypeSelect}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.loanType ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            disabled={loading}
                                        >
                                            <option value="">
                                                {loading ? 'Loading...' : 'Select loan type'}
                                            </option>
                                            {loanTypes.map((loanType) => (
                                                <option key={loanType.loan_type_id} value={loanType.loan_type_id}>
                                                    {loanType.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.loanType && (
                                            <p className="text-red-500 text-xs mt-1">{errors.loanType}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Amount *
                                        </label>
                                        <input
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleInputChange}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            min="0"
                                            step="0.01"
                                            placeholder="Enter amount"
                                        />
                                        {errors.amount && (
                                            <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Priority *
                                        </label>
                                        <select
                                            value={formData.priorityId}
                                            onChange={handlePrioritySelect}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.priority ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            disabled={loading}
                                        >
                                            <option value="">
                                                {loading ? 'Loading...' : 'Select priority'}
                                            </option>
                                            {priorities.map((priority) => (
                                                <option key={priority.loan_priority_id} value={priority.loan_priority_id}>
                                                    {priority.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.priority && (
                                            <p className="text-red-500 text-xs mt-1">{errors.priority}</p>
                                        )}
                                    </div>
                                </div>

                                {formData.loanType === 'Loan' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                                <Percent size={16} />
                                                Interest Rate (Monthly) *
                                            </label>
                                            <input
                                                type="number"
                                                name="interestRate"
                                                value={formData.interestRate}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.interestRate ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                min="0"
                                                step="0.01"
                                                placeholder="Enter interest rate"
                                            />
                                            {errors.interestRate && (
                                                <p className="text-red-500 text-xs mt-1">{errors.interestRate}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                                <Clock size={16} />
                                                Tenure (Months) *
                                            </label>
                                            <input
                                                type="number"
                                                name="tenure"
                                                value={formData.tenure}
                                                onChange={handleInputChange}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.tenure ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                min="1"
                                                placeholder="Enter tenure"
                                            />
                                            {errors.tenure && (
                                                <p className="text-red-500 text-xs mt-1">{errors.tenure}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Monthly Installment
                                            </label>
                                            <input
                                                type="number"
                                                name="installmentAmount"
                                                value={formData.installmentAmount}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dates and Status */}
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar size={20} className="text-purple-600" />
                                    Dates & Status
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Approval Status *
                                        </label>
                                        <select
                                            value={formData.approvalStatusId}
                                            onChange={handleStatusSelect}
                                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.approvalStatus ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            disabled={loading}
                                        >
                                            <option value="">
                                                {loading ? 'Loading...' : 'Select status'}
                                            </option>
                                            {statuses.map((status) => (
                                                <option key={status.status_id} value={status.status_id}>
                                                    {status.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.approvalStatus && (
                                            <p className="text-red-500 text-xs mt-1">{errors.approvalStatus}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Disbursement Date
                                        </label>
                                        <input
                                            type="date"
                                            name="disbursementDate"
                                            value={formData.disbursementDate}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Repayment Start Date
                                        </label>
                                        <input
                                            type="date"
                                            name="repaymentStartDate"
                                            value={formData.repaymentStartDate}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Guarantor Information */}
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle size={20} className="text-orange-600" />
                                    Guarantor Information (Optional)
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Guarantor Name
                                        </label>
                                        <input
                                            type="text"
                                            name="guarantorName"
                                            value={formData.guarantorName}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter guarantor name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Guarantor Contact
                                        </label>
                                        <input
                                            type="text"
                                            name="guarantorContact"
                                            value={formData.guarantorContact}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Enter contact number/email"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText size={20} className="text-yellow-600" />
                                    Additional Information
                                </h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Reason/Purpose *
                                    </label>
                                    <textarea
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.reason ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Explain the reason for this loan/advance request..."
                                    />
                                    {errors.reason && (
                                        <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleBack}
                                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        {existingLoan ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        {existingLoan ? 'Update Loan/Advance' : 'Create Loan/Advance'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </div>
    );
};

export default AddLoanAdvance;