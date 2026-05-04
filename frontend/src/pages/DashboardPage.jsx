import { useContext } from 'react';
import Health from '../components/Health';
import { AuthContext } from '../App';

function DashboardPage() {
    const { logout } = useContext(AuthContext);

    return (
        <div className="min-h-screen relative" style={{
            background: 'linear-gradient(0.76deg,#e4eaf7 1.31%,#f0f4fd 106.94%)',
        }}>
            {/* Logout button in top right */}
            <button 
                onClick={logout}
                className="absolute top-4 right-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition duration-200 flex items-center shadow-md"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
            </button>

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto space-y-10">
                    {/* Header with Piramal Finance theme */}
                    <div className="text-center">
                        <h1 className="text-3xl font-extrabold text-gray-700 mb-2">
                        {{APP_DISPLAY_NAME}}
                        </h1>
                    </div>

                    {/* Card with shadow */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="border-b border-gray-200 pb-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-700">
                                System Status
                            </h2>
                        </div>

                        {/* Health component displays system status */}
                        <Health />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
