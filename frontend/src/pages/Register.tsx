import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { register } from '../utils/api';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        security_question: '',
        security_answer: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const SECURITY_QUESTIONS = [
        "What is your Staff ID Number?",
        "What is the name of your first assigned department?",
        "What year did you assume your current role?",
        "What is your office extension number?"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const result = await register({
                username: formData.username,
                password: formData.password,
                security_question: formData.security_question,
                security_answer: formData.security_answer
            });

            if (result.success) {
                alert('Registration successful! Please login.');
                navigate('/login');
            } else {
                setError(result.message || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
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
                        <UserPlus className="text-primary-600 dark:text-primary-400" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Registration</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Create a new admin account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirm
                            </label>
                            <input
                                type="password"
                                required
                                className="input-field"
                                value={formData.confirmPassword}
                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Security Question
                        </label>
                        <select
                            required
                            className="input-field"
                            value={formData.security_question}
                            onChange={e => setFormData({ ...formData, security_question: e.target.value })}
                        >
                            <option value="">Select a question...</option>
                            {SECURITY_QUESTIONS.map((q, i) => (
                                <option key={i} value={q}>{q}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Security Answer
                        </label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            placeholder="Your answer..."
                            value={formData.security_answer}
                            onChange={e => setFormData({ ...formData, security_answer: e.target.value })}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3 mt-4"
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
