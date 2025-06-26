import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, ArrowLeft, User, Building, CreditCard, FileText, Phone, Calendar, Users, Edit } from 'lucide-react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';

const AddEmployee = () => {
    const { employeeId } = useParams(); // Get employee ID from URL params
    const location = useLocation();
    const navigate = useNavigate();

    // Check for edit mode from both URL params and query params
    const queryParams = new URLSearchParams(location.search);
    const editEmployeeId = employeeId || queryParams.get('edit');
    const isEditMode = Boolean(editEmployeeId);

    const [formData, setFormData] = useState({
        // Basic Details
        employeeCode: '',
        name: '',
        mobile: '',
        email: '',
        gender: '',
        branch: '',
        department: '',
        designation: '',
        employmentType: '',
        salaryType: '',
        salary: '',
        address: '',

        // Bank Details
        bankName: '',
        branchName: '',
        accountNo: '',
        ifscCode: '',

        // Legal Documents
        aadharCard: null,
        drivingLicence: null,
        panCard: null,
        photo: null,

        // Contact Information
        emergencyContactNo: '',
        contactPersonName: '',
        relation: '',
        emergencyAddress: '',

        // Personal Information
        dateOfBirth: '',
        dateOfJoining: '',

        // References
        references: [{ name: '', contactNumber: '' }]
    });

    const [expandedSections, setExpandedSections] = useState({
        basicDetails: true,
        bankDetails: false,
        legalDocuments: false,
        contactInformation: false,
        personalInformation: false,
        reference: false
    });

    const [filePreviews, setFilePreviews] = useState({
        aadharCard: null,
        drivingLicence: null,
        panCard: null,
        photo: null
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);
    const [isLoadingEmployeeData, setIsLoadingEmployeeData] = useState(false);

    // Dropdown options from API
    const [dropdownOptions, setDropdownOptions] = useState({
        genderOptions: [],
        branchOptions: [],
        departmentOptions: [],
        designationOptions: [],
        employmentTypeOptions: [],
        salaryTypeOptions: [],
        relationOptions: []
    });

    // Fetch dropdown data
    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                // Check if user is authenticated and has user_id
                if (!isAuthenticated() || !user?.user_id) {
                    setMessage({
                        type: 'error',
                        text: 'User authentication required. Please login again.'
                    });
                    setIsLoadingDropdowns(false);
                    return;
                }

                setIsLoadingDropdowns(true);

                const formData = new FormData();
                formData.append('user_id', user.user_id);

                const response = await api.post('/employee_drop_down_list', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.data.success) {
                    const data = response.data.data;

                    const dropdownData = {
                        genderOptions: data.gender_list?.map(item => ({
                            value: item.gender_id,
                            label: item.name
                        })) || [],
                        branchOptions: data.branch_list?.map(item => ({
                            value: item.branch_id,
                            label: item.name
                        })) || [],
                        departmentOptions: data.department_list?.map(item => ({
                            value: item.department_id,
                            label: item.name
                        })) || [],
                        designationOptions: data.designation_list?.map(item => ({
                            value: item.designation_id,
                            label: item.name
                        })) || [],
                        employmentTypeOptions: data.employee_type_list?.map(item => ({
                            value: item.employee_type_id, // Fixed: was using salary_type_id
                            label: item.name
                        })) || [],
                        salaryTypeOptions: data.salary_type_list?.map(item => ({
                            value: item.salary_type_id,
                            label: item.name
                        })) || [],
                        relationOptions: data.relation_list?.map(item => ({
                            value: item.relation_id,
                            label: item.name
                        })) || []
                    };

                    setDropdownOptions(dropdownData);
                } else {
                    setMessage({
                        type: 'error',
                        text: response.data.message || 'Failed to load dropdown options.'
                    });
                }
            } catch (error) {
                console.error('Error fetching dropdown data:', error);
                setMessage({
                    type: 'error',
                    text: 'Failed to load dropdown options. Please refresh the page.'
                });
            } finally {
                setIsLoadingDropdowns(false);
            }
        };

        fetchDropdownData();
    }, [user, isAuthenticated]);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            if (!isEditMode || !editEmployeeId || !isAuthenticated() || !user?.user_id) return;

            setIsLoadingEmployeeData(true);

            try {
                const formDataToSend = new FormData();
                formDataToSend.append('user_id', user.user_id);
                formDataToSend.append('employee_id', editEmployeeId);

                const response = await api.post('/employee_edit_data_fetch', formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                const { data, success } = response.data;

                if (!success || !data || typeof data !== 'object' || !data.employee) {
                    setMessage({
                        type: 'error',
                        text: 'Failed to load employee data properly.'
                    });
                    return;
                }

                const employee = data.employee;
                const baseUrl = data.base_url || '';
                const references = data.employee_reference || [];

                const mappedFormData = {
                    employeeCode: employee.employee_code || '',
                    name: employee.full_name || '',
                    mobile: employee.mobile_number || '',
                    email: employee.email || '',
                    gender: employee.gender_id || '',
                    branch: employee.branch_id || '',
                    department: employee.department_id || '',
                    designation: employee.designation_id || '',
                    employmentType: employee.employment_type_id || '',
                    salaryType: employee.salary_type_id || '',
                    salary: employee.salary || '',
                    address: employee.address || '',

                    bankName: employee.bank_name || '',
                    branchName: employee.bank_branch || '',
                    accountNo: employee.bank_account_number || '',
                    ifscCode: employee.bank_ifsc_code || '',

                    emergencyContactNo: employee.emergency_contact_number || '',
                    contactPersonName: employee.emergency_contact_name || '',
                    relation: employee.emergency_relation || '',
                    emergencyAddress: employee.emergency_address || '',

                    dateOfBirth: employee.dob || '',
                    dateOfJoining: employee.date_of_joining || '',

                    references: references.length
                        ? references.map(ref => ({
                            name: ref.name || '',
                            contactNumber: ref.number || ''
                        }))
                        : [{ name: '', contactNumber: '' }],

                    aadharCard: null,
                    drivingLicence: null,
                    panCard: null,
                    photo: null
                };

                setFormData(mappedFormData);

                const filePreviews = {
                    aadharCard: employee.aadharcard_img ? baseUrl + employee.aadharcard_img : null,
                    drivingLicence: employee.dl_img ? baseUrl + employee.dl_img : null,
                    panCard: employee.pan_img ? baseUrl + employee.pan_img : null,
                    photo: employee.photo_img ? baseUrl + employee.photo_img : null
                };

                setFilePreviews(filePreviews);

                setTimeout(() => {
                    setMessage({ type: '', text: '' });
                }, 3000);
            } catch (error) {
                setMessage({
                    type: error,
                    text: 'Failed to fetch employee data. Please try again.'
                });
            } finally {
                setIsLoadingEmployeeData(false);
            }
        };

        if (!isLoadingDropdowns) {
            fetchEmployeeData();
        }
    }, [isEditMode, editEmployeeId, user, isAuthenticated, isLoadingDropdowns]);




    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            const file = files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, [name]: file })); // Store the actual file object
                    setFilePreviews(prev => ({ ...prev, [name]: reader.result })); // Store base64 for preview
                };
                reader.readAsDataURL(file);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleReferenceChange = (index, field, value) => {
        const updatedReferences = [...formData.references];
        updatedReferences[index][field] = value;
        setFormData(prev => ({ ...prev, references: updatedReferences }));
    };

    const addReference = () => {
        setFormData(prev => ({
            ...prev,
            references: [...prev.references, { name: '', contactNumber: '' }]
        }));
    };

    const removeReference = (index) => {
        if (formData.references.length > 1) {
            const updatedReferences = formData.references.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, references: updatedReferences }));
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const validateForm = () => {
        const errors = [];

        // Basic Details validation
        if (!formData.employeeCode.trim()) errors.push('Employee Code');
        if (!formData.name.trim()) errors.push('Full Name');
        if (!formData.mobile.trim()) errors.push('Mobile Number');
        if (!formData.gender) errors.push('Gender');
        if (!formData.branch) errors.push('Branch');
        if (!formData.department) errors.push('Department');
        if (!formData.designation) errors.push('Designation');

        // Bank Details validation
        if (!formData.bankName.trim()) errors.push('Bank Name');
        if (!formData.branchName.trim()) errors.push('Branch Name');
        if (!formData.accountNo.trim()) errors.push('Account Number');
        if (!formData.ifscCode.trim()) errors.push('IFSC Code');

        if (!isEditMode) {
            if (!formData.aadharCard) errors.push('Aadhar Card');
            if (!formData.panCard) errors.push('PAN Card');
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        // Validate form
        const validationErrors = validateForm();

        if (validationErrors.length > 0) {
            const errorMessage = validationErrors.length === 1
                ? `Please fill in the required field: ${validationErrors[0]}`
                : `Please fill in the following required fields: ${validationErrors.join(', ')}`;

            setMessage({ type: 'error', text: errorMessage });
            setIsSubmitting(false);

            // Scroll to top to show the error message
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            // Check if user is authenticated and has user_id
            if (!isAuthenticated() || !user?.user_id) {
                setMessage({
                    type: 'error',
                    text: 'User authentication required. Please login again.'
                });
                setIsSubmitting(false);
                return;
            }

            // Create FormData for API submission
            const formDataToSend = new FormData();

            // Add user_id
            formDataToSend.append('user_id', user.user_id);

            // Add employee_id for edit mode
            if (isEditMode && editEmployeeId) {
                formDataToSend.append('employee_id', editEmployeeId);
            }

            // Map form fields to API field names
            formDataToSend.append('employee_code', formData.employeeCode);
            formDataToSend.append('full_name', formData.name);
            formDataToSend.append('mobile_number', formData.mobile);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('gender_id', formData.gender);
            formDataToSend.append('branch_id', formData.branch);
            formDataToSend.append('department_id', formData.department);
            formDataToSend.append('designation_id', formData.designation);
            formDataToSend.append('employee_type_id', formData.employmentType);
            formDataToSend.append('salary_type_id', formData.salaryType);
            formDataToSend.append('salary', formData.salary);
            formDataToSend.append('address', formData.address);

            // Bank details
            formDataToSend.append('bank_name', formData.bankName);
            formDataToSend.append('bank_branch', formData.branchName);
            formDataToSend.append('bank_account_number', formData.accountNo);
            formDataToSend.append('bank_ifsc_code', formData.ifscCode);

            // Emergency contact details
            formDataToSend.append('emergency_contact_name', formData.contactPersonName);
            formDataToSend.append('emergency_contact_number', formData.emergencyContactNo);
            formDataToSend.append('emergency_relation_id', formData.relation);
            formDataToSend.append('emergency_address', formData.emergencyAddress);

            // Personal information
            formDataToSend.append('dob', formData.dateOfBirth);
            formDataToSend.append('date_of_joining', formData.dateOfJoining);

            // References - append as arrays
            formData.references.forEach((reference) => {
                if (reference.name && reference.contactNumber) {
                    formDataToSend.append('reference_name[]', reference.name);
                    formDataToSend.append('reference_number[]', reference.contactNumber);
                }
            });

            // Handle file uploads
            const fileFields = ['aadharCard', 'drivingLicence', 'panCard', 'photo'];
            const apiFileFields = ['aadharcard_img', 'dl_img', 'pan_card', 'passport_img'];

            fileFields.forEach((formField, index) => {
                const apiField = apiFileFields[index];
                const file = formData[formField];
                if (file && file instanceof File) {
                    formDataToSend.append(apiField, file);
                }
            });



            // Choose the appropriate API endpoint
            const apiEndpoint = '/employee_create';

            const response = await api.post(apiEndpoint, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setMessage({
                    type: 'success',
                    text: isEditMode ? 'Employee updated successfully!' : 'Employee added successfully!'
                });

                // Reset form only for add mode
                if (!isEditMode) {
                    setFormData({
                        employeeCode: '',
                        name: '',
                        mobile: '',
                        email: '',
                        gender: '',
                        branch: '',
                        department: '',
                        designation: '',
                        employmentType: '',
                        salaryType: '',
                        salary: '',
                        address: '',
                        bankName: '',
                        branchName: '',
                        accountNo: '',
                        ifscCode: '',
                        aadharCard: null,
                        drivingLicence: null,
                        panCard: null,
                        photo: null,
                        emergencyContactNo: '',
                        contactPersonName: '',
                        relation: '',
                        emergencyAddress: '',
                        dateOfBirth: '',
                        dateOfJoining: '',
                        references: [{ name: '', contactNumber: '' }]
                    });
                    setFilePreviews({
                        aadharCard: null,
                        drivingLicence: null,
                        panCard: null,
                        photo: null
                    });
                } else {
                    // For edit mode, optionally redirect back to employee list after a delay
                    setTimeout(() => {
                        navigate('/employee'); // Adjust the route as needed
                    }, 2000);
                }
            } else {
                setMessage({
                    type: 'error',
                    text: response.data.message || `Failed to ${isEditMode ? 'update' : 'add'} employee.`
                });
            }

            // Scroll to top to show the success/error message
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            console.error('Error saving employee:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} employee. Please try again.`
            });
            // Scroll to top to show the error message
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const goBack = () => {
        navigate(-1); // Better than window.history.back() in React Router
    };

    const sections = [
        {
            key: 'basicDetails',
            title: 'Basic Details',
            icon: User,
            color: 'blue'
        },
        {
            key: 'bankDetails',
            title: 'Bank Details',
            icon: CreditCard,
            color: 'green'
        },
        {
            key: 'legalDocuments',
            title: 'Legal Documents',
            icon: FileText,
            color: 'purple'
        },
        {
            key: 'contactInformation',
            title: 'Contact Information',
            icon: Phone,
            color: 'orange'
        },
        {
            key: 'personalInformation',
            title: 'Personal Information',
            icon: Calendar,
            color: 'indigo'
        },
        {
            key: 'reference',
            title: 'References',
            icon: Users,
            color: 'pink'
        }
    ];

    if (isLoadingDropdowns || isLoadingEmployeeData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        {isLoadingDropdowns ? 'Loading form data...' : 'Loading employee data...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={goBack}
                                className="flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm"
                            >
                                <ArrowLeft size={18} />
                                Back
                            </button>
                            <div className="flex items-center gap-3">
                                {isEditMode ? <Edit size={24} className="text-white" /> : ""}
                                <div>
                                    <h1 className="text-2xl font-bold text-white">
                                        {isEditMode ? 'Edit Employee' : 'Add New Employee'}
                                    </h1>
                                    <p className="text-blue-100 text-sm mt-1">
                                        {isEditMode ? 'Update employee details below' : 'Fill in the employee details below'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    {message.text && (
                        <div className={`mx-6 mt-6 p-4 rounded-xl border-l-4 ${message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                            : 'bg-red-50 text-red-800 border-red-400'
                            }`}>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                                {message.text}
                            </div>
                        </div>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {sections.map((section) => (
                        <div key={section.key} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => toggleSection(section.key)}
                                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-all duration-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-${section.color}-100`}>
                                        <section.icon size={20} className={`text-${section.color}-600`} />
                                    </div>
                                    <span className="font-semibold text-gray-900 text-lg">{section.title}</span>
                                </div>
                                <div className={`p-1 rounded-full ${expandedSections[section.key] ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                    {expandedSections[section.key] ?
                                        <ChevronUp size={20} className="text-blue-600" /> :
                                        <ChevronDown size={20} className="text-gray-600" />
                                    }
                                </div>
                            </button>

                            {expandedSections[section.key] && (
                                <div className="border-t border-gray-100">
                                    {section.key === 'basicDetails' && (
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Employee Code *</label>
                                                <input
                                                    type="text"
                                                    name="employeeCode"
                                                    value={formData.employeeCode}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="Enter employee code"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Full Name *</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="Enter full name"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Mobile Number *</label>
                                                <input
                                                    type="tel"
                                                    name="mobile"
                                                    value={formData.mobile}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="Enter mobile number"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Email Address</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="Enter email address"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Gender *</label>
                                                <select
                                                    name="gender"
                                                    value={formData.gender}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    required
                                                >
                                                    <option value="">Select Gender</option>
                                                    {dropdownOptions.genderOptions.map(option => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Branch *</label>
                                                <select
                                                    name="branch"
                                                    value={formData.branch}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    required
                                                >
                                                    <option value="">Select Branch</option>
                                                    {dropdownOptions.branchOptions.map(option => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Department *</label>
                                                <select
                                                    name="department"
                                                    value={formData.department}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    required
                                                >
                                                    <option value="">Select Department</option>
                                                    {dropdownOptions.departmentOptions.map(option => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Designation *</label>
                                                <select
                                                    name="designation"
                                                    value={formData.designation}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    required
                                                >
                                                    <option value="">Select Designation</option>
                                                    {dropdownOptions.designationOptions.map(option => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Employment Type</label>
                                                <select
                                                    name="employmentType"
                                                    value={formData.employmentType}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                >
                                                    <option value="">Select Employment Type</option>
                                                    {dropdownOptions.employmentTypeOptions.map(option => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Salary Type</label>
                                                <select
                                                    name="salaryType"
                                                    value={formData.salaryType}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                >
                                                    <option value="">Select Salary Type</option>
                                                    {dropdownOptions.salaryTypeOptions.map(option => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Salary</label>
                                                <input
                                                    type="number"
                                                    name="salary"
                                                    value={formData.salary}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="Enter salary amount"
                                                />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700">Address</label>
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                                    placeholder="Enter address"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {section.key === 'bankDetails' && (
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Bank Name *</label>
                                                <input
                                                    type="text"
                                                    name="bankName"
                                                    value={formData.bankName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="Enter bank name"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Branch Name *</label>
                                                <input
                                                    type="text"
                                                    name="branchName"
                                                    value={formData.branchName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="Enter branch name"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Account Number *</label>
                                                <input
                                                    type="text"
                                                    name="accountNo"
                                                    value={formData.accountNo}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="Enter account number"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">IFSC Code *</label>
                                                <input
                                                    type="text"
                                                    name="ifscCode"
                                                    value={formData.ifscCode}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="Enter IFSC code"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {section.key === 'legalDocuments' && (
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    Aadhar Card {!isEditMode && '*'}
                                                </label>
                                                <input
                                                    type="file"
                                                    name="aadharCard"
                                                    onChange={handleInputChange}
                                                    accept="image/*,.pdf"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    {...(!isEditMode && { required: true })}
                                                />
                                                {filePreviews.aadharCard && (
                                                    <div className="mt-2">
                                                        {typeof filePreviews.aadharCard === 'string' && filePreviews.aadharCard.startsWith('data:') ? (
                                                            <img
                                                                src={filePreviews.aadharCard}
                                                                alt="Aadhar Card Preview"
                                                                className="h-20 w-20 object-cover rounded-lg border"
                                                            />
                                                        ) : (
                                                            <div className="p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                                                                📄 Document uploaded
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Driving Licence</label>
                                                <input
                                                    type="file"
                                                    name="drivingLicence"
                                                    onChange={handleInputChange}
                                                    accept="image/*,.pdf"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                                {filePreviews.drivingLicence && (
                                                    <div className="mt-2">
                                                        {typeof filePreviews.drivingLicence === 'string' && filePreviews.drivingLicence.startsWith('data:') ? (
                                                            <img
                                                                src={filePreviews.drivingLicence}
                                                                alt="Driving Licence Preview"
                                                                className="h-20 w-20 object-cover rounded-lg border"
                                                            />
                                                        ) : (
                                                            <div className="p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                                                                📄 Document uploaded
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">
                                                    PAN Card {!isEditMode && '*'}
                                                </label>
                                                <input
                                                    type="file"
                                                    name="panCard"
                                                    onChange={handleInputChange}
                                                    accept="image/*,.pdf"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    {...(!isEditMode && { required: true })}
                                                />
                                                {filePreviews.panCard && (
                                                    <div className="mt-2">
                                                        {typeof filePreviews.panCard === 'string' && filePreviews.panCard.startsWith('data:') ? (
                                                            <img
                                                                src={filePreviews.panCard}
                                                                alt="PAN Card Preview"
                                                                className="h-20 w-20 object-cover rounded-lg border"
                                                            />
                                                        ) : (
                                                            <div className="p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                                                                📄 Document uploaded
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Photo</label>
                                                <input
                                                    type="file"
                                                    name="photo"
                                                    onChange={handleInputChange}
                                                    accept="image/*"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                                {filePreviews.photo && (
                                                    <div className="mt-2">
                                                        {typeof filePreviews.photo === 'string' && filePreviews.photo.startsWith('data:') ? (
                                                            <img
                                                                src={filePreviews.photo}
                                                                alt="Photo Preview"
                                                                className="h-20 w-20 object-cover rounded-lg border"
                                                            />
                                                        ) : (
                                                            <div className="p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                                                                📄 Photo uploaded
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {section.key === 'contactInformation' && (
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Emergency Contact Number</label>
                                                <input
                                                    type="tel"
                                                    name="emergencyContactNo"
                                                    value={formData.emergencyContactNo}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="Enter emergency contact number"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Contact Person Name</label>
                                                <input
                                                    type="text"
                                                    name="contactPersonName"
                                                    value={formData.contactPersonName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    placeholder="Enter contact person name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Relation</label>
                                                <select
                                                    name="relation"
                                                    value={formData.relation}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                >
                                                    <option value="">Select Relation</option>
                                                    {dropdownOptions.relationOptions.map(option => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700">Emergency Address</label>
                                                <textarea
                                                    name="emergencyAddress"
                                                    value={formData.emergencyAddress}
                                                    onChange={handleInputChange}
                                                    rows="3"
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                                    placeholder="Enter emergency address"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {section.key === 'personalInformation' && (
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Date of Birth</label>
                                                <input
                                                    type="date"
                                                    name="dateOfBirth"
                                                    value={formData.dateOfBirth}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-sm font-semibold text-gray-700">Date of Joining</label>
                                                <input
                                                    type="date"
                                                    name="dateOfJoining"
                                                    value={formData.dateOfJoining}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {section.key === 'reference' && (
                                        <div className="p-6">
                                            <div className="space-y-4">
                                                {formData.references.map((reference, index) => (
                                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="text-sm font-semibold text-gray-700">Reference {index + 1}</h4>
                                                            {formData.references.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeReference(index)}
                                                                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-medium text-gray-600">Name</label>
                                                                <input
                                                                    type="text"
                                                                    value={reference.name}
                                                                    onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                                    placeholder="Enter reference name"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="block text-sm font-medium text-gray-600">Contact Number</label>
                                                                <input
                                                                    type="tel"
                                                                    value={reference.contactNumber}
                                                                    onChange={(e) => handleReferenceChange(index, 'contactNumber', e.target.value)}
                                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                                    placeholder="Enter contact number"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={addReference}
                                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                                >
                                                    <Plus size={16} />
                                                    Add Another Reference
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Submit Button */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <div className="flex gap-4 justify-end">
                            <button
                                type="button"
                                onClick={goBack}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                {isSubmitting
                                    ? (isEditMode ? 'Updating...' : 'Adding...')
                                    : (isEditMode ? 'Update Employee' : 'Add Employee')
                                }
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployee;