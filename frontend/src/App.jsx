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
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const authStatus = checkAuth();
        setIsAuthenticated(authStatus);
    }, []);

    const login = () => {
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            await authLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
        }
    };

    // Auth context value
    const authValue = {
        isAuthenticated,
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
                        element={
                            isAuthenticated ? (
                                <Navigate to="/" />
                            ) : (
                                <LoginPage />
                            )
                        }
                    />
                    <Route
                        path="/"
                        element={
                            isAuthenticated ? (
                                <DashboardPage />
                            ) : (
                                <Navigate to="/login" />
                            )
                        }
                    />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthContext.Provider>
    );
}

export default App;
