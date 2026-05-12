import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import { useState, createContext, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import {
    isAuthenticated as checkAuth,
    logout as authLogout,
} from './client/login';

export const AuthContext = createContext(null);

function App() {
    // # AI: Start - Remove authentication requirement
    const [isAuthenticated, setIsAuthenticated] = useState(true); // Always authenticated

    const login = () => {
        setIsAuthenticated(true);
    };

    const logout = async () => {
        // For demo purposes, just log the action but don't actually logout
        console.log('Logout clicked - in a real app this would logout the user');
    };

    // Auth context value
    const authValue = {
        isAuthenticated: true, // Always authenticated
        login,
        logout,
    };

    const basePath = import.meta.env.BASE_URL;

    return (
        <AuthContext.Provider value={authValue}>
            <Router basename={basePath}>
                <Routes>
                    <Route
                        path="/login"
                        element={<Navigate to="/" />}
                    />
                    <Route
                        path="/"
                        element={<DashboardPage />}
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthContext.Provider>
    );
    // # AI: End
}

export default App;
