import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = () => {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    // ✅ FIXED LOGIN (NO API - DIRECT LOGIN)
    const login = async (email, password) => {

        // ✅ HOD LOGIN
        if (email === 'hod@kce.edu' && password === 'HODCSE1234') {
            const userData = {
                email: 'hod@kce.edu',
                role: 'hod',
                name: 'HOD'
            };

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', 'dummy-token-hod');

            setUser(userData);

            return { success: true, user: userData };
        }

        // ✅ STAFF LOGIN
        if (email === 'staff@kce.edu' && password === 'STAFF@CSE') {
            const userData = {
                email: 'staff@kce.edu',
                role: 'staff',
                name: 'Staff'
            };

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', 'dummy-token-staff');

            setUser(userData);

            return { success: true, user: userData };
        }

        // ❌ INVALID LOGIN
        return {
            success: false,
            message: 'Invalid email or password'
        };
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// ✅ FIXED EXPORT (you had typo here)
export const useAuth = () => useContext(AuthContext);
