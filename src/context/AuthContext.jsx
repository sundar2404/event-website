import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(() => {
        const savedUser = localStorage.getItem('adminUser');
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            return null;
        }
    });
    const [token, setToken] = useState(localStorage.getItem('adminToken'));

    const loginAdmin = (adminData, authToken) => {
        setAdmin(adminData);
        setToken(authToken);
        localStorage.setItem('adminToken', authToken);
        localStorage.setItem('adminUser', JSON.stringify(adminData));
    };

    const logoutAdmin = () => {
        setAdmin(null);
        setToken(null);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    };

    return (
        <AuthContext.Provider value={{ admin, token, loginAdmin, logoutAdmin, isAdmin: !!admin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
