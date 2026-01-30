import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { login } from '../utils/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(username, password);
            if (result.success) {
                localStorage.setItem('isAuthenticated', 'true');
                navigate('/admin');
            } else {
                setError(result.message || 'Invalid Credentials');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <div className="card max-w-md w-full p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="text-primary-600 dark:text-primary-400" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Access</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Enter credentials to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-field"
                            placeholder="admin"
                            autoFocus
                            required
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex justify-center py-3"
                    >
                        {loading ? 'Verifying...' : 'Login'}
                    </button>

                    <div className="flex justify-between text-sm mt-4">
                        <a href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                            Create Account
                        </a>
                        <a href="/forgot-password" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                            Forgot Password?
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
