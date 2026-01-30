import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { getSecurityQuestion, resetPassword } from '../utils/api';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleVerifyUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await getSecurityQuestion(username);
            if (result.success && result.question) {
                setQuestion(result.question);
                setStep(2);
            } else {
                setError(result.message || 'User not found');
            }
        } catch (err) {
            setError('User verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await resetPassword({
                username,
                security_answer: answer,
                new_password: newPassword
            });

            if (result.success) {
                alert('Password reset successful! Please login with new password.');
                navigate('/login');
            } else {
                setError(result.message || 'Reset failed. Check your security answer.');
            }
        } catch (err) {
            setError('Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <div className="card max-w-md w-full p-8 relative">
                <button
                    onClick={() => navigate('/login')}
                    className="absolute top-8 left-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="text-primary-600 dark:text-primary-400" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recover Password</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {step === 1 ? 'Enter your username to find your account' : 'Answer security question to reset'}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleVerifyUser} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Username
                            </label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                        >
                            {loading ? 'Verifying...' : 'Next'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">Security Question:</p>
                            <p className="text-base text-gray-800 dark:text-gray-200">{question}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Your Answer
                            </label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                placeholder="Answer..."
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="New password"
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                            {!loading && <Check size={18} />}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
