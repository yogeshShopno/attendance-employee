import { createContext, useContext, useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const AuthContext = createContext();

const USER_KEY = 'auth_user';
const TIMESTAMP_KEY = 'auth_timestamp';
const LOGIN_RESPONSE_KEY = 'login_response';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;
const SECRET_KEY = import.meta.env.VITE_AES_SECRET_KEY;

// AES encryption helpers (in-file)
const encrypt = (data) => {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
};

const decrypt = (ciphertext) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption failed:', error);
        return null;
    }
};

const setItem = (key, value) => {
    const encrypted = encrypt(value);
    sessionStorage.setItem(key, encrypted);
};

const getItem = (key) => {
    const encrypted = sessionStorage.getItem(key);
    if (!encrypted) return null;
    return decrypt(encrypted);
};

const removeItem = (key) => {
    sessionStorage.removeItem(key);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loginResponse, setLoginResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const isSessionExpired = () => {
        const timestamp = getItem(TIMESTAMP_KEY);
        return !timestamp || (Date.now() - timestamp) > SESSION_TIMEOUT;
    };

    const updateTimestamp = () => {
        setItem(TIMESTAMP_KEY, Date.now());
    };

    const clearSession = () => {
        removeItem(USER_KEY);
        removeItem(TIMESTAMP_KEY);
        removeItem(LOGIN_RESPONSE_KEY);
    };

    useEffect(() => {
        try {
            if (isSessionExpired()) {
                clearSession();
            } else {
                const savedUser = getItem(USER_KEY);
                const savedLoginResponse = getItem(LOGIN_RESPONSE_KEY);

                if (savedUser) {
                    setUser(savedUser);
                    setLoginResponse(savedLoginResponse);
                    updateTimestamp();
                }
            }
        } catch (error) {
            console.error('Error loading session:', error);
            clearSession();
        }
        setIsLoading(false);
    }, []);

    const login = (loginResponseData) => {
        if (!loginResponseData || !loginResponseData.success) {
            console.error('Invalid login response');
            return false;
        }

        const { employee_data } = loginResponseData;

        // Create user object from employee_data
        const userWithSession = {
            ...employee_data,
            loginTime: Date.now(),
            sessionId: Math.random().toString(36).substring(2, 15)
        };

        // Store both user and complete login response
        setUser(userWithSession);
        setLoginResponse(loginResponseData);

        setItem(USER_KEY, userWithSession);
        setItem(LOGIN_RESPONSE_KEY, loginResponseData);
        updateTimestamp();

        return true;
    };

    const logout = () => {
        setUser(null);
        setLoginResponse(null);
        clearSession();
        window.location.href = '/';
    };

    const updateUser = (updates) => {
        if (!user || !updates) return false;

        const updatedUser = {
            ...user,
            ...updates,
            lastUpdated: Date.now()
        };

        setUser(updatedUser);
        setItem(USER_KEY, updatedUser);
        updateTimestamp();
        return true;
    };

    const isAuthenticated = () => {
        return user !== null && !isSessionExpired();
    };

    const getEmployeeData = () => {
        return loginResponse?.employee_data || null;
    };

    const getLoginMessage = () => {
        return loginResponse?.message || '';
    };

    return (
        <AuthContext.Provider value={{
            user,
            loginResponse,
            login,
            logout,
            updateUser,
            isLoading,
            isAuthenticated,
            getEmployeeData,
            getLoginMessage
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};