import { useState, useEffect } from 'react';
import {
    Users, Check, Trash2, Activity, Clock, Settings, Save
} from 'lucide-react';
import { getAdmins, getAuditLogs, verifyAdmin, deleteAdmin, clearAuditLogs } from '../utils/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import type { AdminUser, AuditLog } from '../types';

const SuperAdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'logs' | 'settings'>('users');
    const [profileForm, setProfileForm] = useState({
        username: localStorage.getItem('username') || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);

    // Auto-refresh data on mount and tab switch
    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'users') {
                const data = await getAdmins();
                setUsers(data);
            } else {
                const data = await getAuditLogs();
                setLogs(data);
            }
        } catch (error) {
            console.error('Failed to load data', error);
            alert('Failed to load data. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: number) => {
        try {
            await verifyAdmin(id);
            loadData(); // Reload
        } catch (error) {
            alert('Failed to verification');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this admin?')) return;
        try {
            await deleteAdmin(id);
            loadData(); // Reload
        } catch (error) {
            alert('Failed to delete');
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (profileForm.new_password && profileForm.new_password !== profileForm.confirm_password) {
            alert("New passwords don't match");
            return;
        }

        try {
            const api = await import('../utils/api');
            const result = await api.updateProfile({
                username: profileForm.username,
                current_password: profileForm.current_password,
                new_password: profileForm.new_password || undefined
            });

            if (result.success && result.user) {
                alert('Profile updated successfully');
                localStorage.setItem('username', result.user.username);
                setProfileForm(prev => ({ ...prev, current_password: '', new_password: '', confirm_password: '' }));
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Update failed');
        }
    };


    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage system access and audit logs</p>
                </div>
                <div className="flex gap-2 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'users'
                            ? 'bg-primary-100 text-primary-800'
                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        aria-current={activeTab === 'users' ? 'page' : undefined}
                    >
                        <Users size={18} className="inline mr-2" />
                        Admins
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'logs'
                            ? 'bg-primary-100 text-primary-800'
                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        aria-current={activeTab === 'logs' ? 'page' : undefined}
                    >
                        <Activity size={18} className="inline mr-2" />
                        Audit Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'settings'
                            ? 'bg-primary-100 text-primary-800'
                            : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        aria-current={activeTab === 'settings' ? 'page' : undefined}
                    >
                        <Settings size={18} className="inline mr-2" />
                        Settings
                    </button>
                </div>
            </div>

            {loading && <LoadingSpinner text="Loading data..." />}

            {!loading && activeTab === 'users' && (
                <div className="card overflow-hidden">
                    {/* Error Display */}
                    {users.length === 0 && (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            No admins found. (This shouldn't happen as you are Super Admin)
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 bg-primary-50 rounded-full flex items-center justify-center">
                                                    <span className="font-bold text-primary-700">{user.username.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                                {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.is_verified ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {user.role !== 'super_admin' && (
                                                <div className="flex justify-end gap-2">
                                                    {!user.is_verified && (
                                                        <button onClick={() => handleVerify(user.id)} className="text-green-600 hover:text-green-900 flex items-center gap-1" title="Approve" aria-label={`Approve ${user.username}`}>
                                                            <Check size={16} /> Approve
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 flex items-center gap-1" title="Delete" aria-label={`Delete ${user.username}`}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && activeTab === 'logs' && (
                <div className="card overflow-hidden">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Activity</h3>
                        <button
                            onClick={async () => {
                                if (confirm('Are you sure you want to clear ALL audit logs? This cannot be undone.')) {
                                    setLoading(true);
                                    try {
                                        await clearAuditLogs();
                                        loadData();
                                        alert('Logs cleared successfully');
                                    } catch (e) {
                                        alert('Failed to clear logs');
                                        setLoading(false);
                                    }
                                }
                            }}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1 text-sm px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            aria-label="Clear Audit Logs"
                        >
                            <Trash2 size={16} /> Clear Logs
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} />
                                                {new Date(log.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {log.admin_username || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-lg truncate" title={log.details}>
                                            {log.details}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-xl mx-auto">
                    <div className="card p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h2>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label htmlFor="profileUsername" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                <input
                                    id="profileUsername"
                                    type="text"
                                    value={profileForm.username}
                                    onChange={e => setProfileForm({ ...profileForm, username: e.target.value })}
                                    className="input-field w-full"
                                    required
                                />
                            </div>

                            <hr className="my-4 border-gray-200 dark:border-gray-700" />

                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password (Required)</label>
                                <input
                                    id="currentPassword"
                                    type="password"
                                    value={profileForm.current_password}
                                    onChange={e => setProfileForm({ ...profileForm, current_password: e.target.value })}
                                    className="input-field w-full"
                                    required
                                    placeholder="Enter current password to make changes"
                                />
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password (Optional)</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={profileForm.new_password}
                                    onChange={e => setProfileForm({ ...profileForm, new_password: e.target.value })}
                                    className="input-field w-full"
                                    placeholder="Leave blank to keep current password"
                                />
                            </div>

                            {profileForm.new_password && (
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        value={profileForm.confirm_password}
                                        onChange={e => setProfileForm({ ...profileForm, confirm_password: e.target.value })}
                                        className="input-field w-full"
                                        required
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="btn-primary w-full flex justify-center items-center gap-2"
                                >
                                    <Save size={18} /> Update Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
