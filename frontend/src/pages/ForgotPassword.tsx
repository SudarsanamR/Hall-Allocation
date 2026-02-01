import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, User, Lock, ArrowRight } from 'lucide-react';
import { getSecurityQuestion, resetPassword } from '../utils/api';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleStep1 = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await getSecurityQuestion(username);
            if (response.success && response.question) {
                setQuestion(response.question);
                setStep(2);
            } else {
                setError(response.message || 'User not found');
            }
        } catch (err) {
            setError('Failed to fetch security question');
        } finally {
            setLoading(false);
        }
    };

    const handleStep2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await resetPassword({
                username,
                answer,
                new_password: newPassword
            });

            if (response.success) {
                setSuccess('Password reset successfully! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(response.message || 'Reset failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <div className="card max-w-md w-full p-8 animate-fade-in">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <KeyRound className="text-primary-600 dark:text-primary-400" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
                </div>

                {success ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center font-medium">
                        {success}
                    </div>
                ) : (
                    <>
                        {step === 1 ? (
                            <form onSubmit={handleStep1} className="space-y-4">
                                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                                    Enter your username to retrieve your security question.
                                </p>
                                <div>
                                    <label htmlFor="fp-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="text-gray-400" size={18} />
                                        </div>
                                        <input
                                            id="fp-username"
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="input-field pl-10"
                                            placeholder="Enter Username"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                {error && <p role="alert" className="text-red-500 text-sm text-center">{error}</p>}
                                <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center py-3">
                                    {loading ? 'Finding User...' : 'Next'} <ArrowRight size={18} className="ml-2" />
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleStep2} className="space-y-4 animate-fade-in">
                                <p className="text-sm text-gray-500 text-center mb-2">Username: <span className="font-semibold text-gray-900 dark:text-gray-100">{username}</span></p>

                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
                                    <p className="text-xs text-blue-800 font-bold uppercase tracking-wider mb-1">Security Question</p>
                                    <p className="text-gray-900 font-medium">{question}</p>
                                </div>

                                <div>

                                    <label htmlFor="fp-answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Answer</label>
                                    <input
                                        id="fp-answer"
                                        type="text"
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        className="input-field"
                                        placeholder="Type answer here"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label htmlFor="fp-new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="text-gray-400" size={18} />
                                        </div>
                                        <input
                                            id="fp-new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="input-field pl-10"
                                            placeholder="Create a new password"
                                            required
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>

                                {error && <p role="alert" className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}

                                <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center py-3">
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setError(''); }}
                                    className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
                                >
                                    Back to Username
                                </button>
                            </form>
                        )}
                    </>
                )}

                <div className="text-center mt-6 border-t pt-4">
                    <Link to="/login" className="text-primary-600 hover:text-primary-500 text-sm">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
