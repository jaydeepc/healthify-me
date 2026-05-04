import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { loginWithSSO } from '../client/login';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }
        
        setIsLoading(true);
        setError('');

        try {
            const authResponse = await loginWithSSO(email, password);
            console.log('Login successful:', authResponse);
            login();
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left side - Hero section */}
            <div
                className="hidden md:flex flex-1 flex-col items-center justify-center p-10 relative"
                style={{
                    background:
                        'linear-gradient(0.76deg,#e4eaf7 1.31%,#f0f4fd 106.94%)',
                }}
            >
                {/* Logo */}
                <div className="self-start mb-20 absolute top-10 left-10">
                    <img
                        src="images/logo.svg"
                        alt="Piramal Finance"
                        className="w-24"
                    />
                </div>

                {/* Hero image */}
                <div className="flex">
                    <img
                        src="images/welcome-image.svg"
                        alt="Welcome"
                        className="w-96"
                    />
                </div>

                {/* Hero text */}
                <div className="text-center mt-8 mb-8">
                    <h2 className="text-2xl font-extrabold text-gray-800">
                    Health Tracker
                    </h2>
                </div>
            </div>

            {/* Right side - Login form */}
            <div className="bg-white w-full md:w-[419px] flex justify-center p-10 pt-40 relative shadow-[0_-2px_10px_-1px_rgba(0,0,0,0.1)]">
                {/* User icon at top-right */}
                <div className="absolute top-10 left-10">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_-2px_10px_-1px_rgba(0,0,0,0.1)]">
                        <img
                            src="images/user-octagon.svg"
                            alt="User"
                            className="w-8 h-8"
                        />
                    </div>
                </div>

                <div className="w-full">
                    {/* Logo for mobile view */}
                    <div className="flex justify-center mb-6 md:hidden">
                        <img
                            src="images/logo.svg"
                            alt="Piramal Finance"
                            className="w-24 mb-8"
                        />
                    </div>

                    <h1 className="text-xl font-extrabold text-gray-700 mb-3 text-left">
                        Login
                    </h1>
                    <p className="text-gray-400 mb-10 text-left max-w-md mx-auto">
                        Enter your email id and password to access Health Tracker
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label
                                htmlFor="email"
                                className="block text-sm text-gray-700 mb-1 font-bold"
                            >
                                Email ID
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full px-1 py-3 focus:outline-none text-gray-700 text-sm relative border-b border-gray-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email ID"
                            />
                        </div>

                        <div className="mb-10">
                            <label
                                htmlFor="password"
                                className="block text-sm text-gray-700 mb-1 font-bold"
                            >
                                Password
                            </label>
                            <div className="relative border-b border-gray-400">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    className="w-full px-1 py-3 border-none rounded focus:outline-none text-gray-700 text-sm"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Password"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke-width="1.5"
                                            stroke="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke-width="1.5"
                                            stroke="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                            />
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-5 p-2 bg-red-50 text-red-600 border border-red-200 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`${
                                email && password
                                    ? 'bg-primary hover:bg-primary-dark'
                                    : 'bg-[#fac3b3]'
                            } text-white font-medium py-3 px-4 rounded-lg transition duration-200 disabled:opacity-70 flex justify-center items-center absolute w-[calc(100%-80px)] bottom-10 left-10`}
                        >
                            {isLoading ? (
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                            ) : null}
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
