'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  username: string;
  email: string;
  display_name: string;
  role: string;
  created_at: string;
  last_login: string;
};

type Topic = {
  id: number;
  name: string;
  description: string;
  question_count: number;
  created_at: string;
};

type Stats = {
  totalUsers: number;
  totalQuestions: number;
  totalAnswers: number;
  totalTopics: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'topics' | 'questions'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalQuestions: 0, totalAnswers: 0, totalTopics: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/auth');
      return;
    }
    
    const userData = JSON.parse(user);
    if (userData.role !== 'admin') {
      router.push('/');
      return;
    }
    
    setCurrentUser(userData);
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, topicsRes, statsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/topics'),
        fetch('/api/admin/stats'),
      ]);
      
      if (usersRes.ok) setUsers(await usersRes.json());
      if (topicsRes.ok) setTopics(await topicsRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTopic = async (topicId: number) => {
    if (!confirm('Delete this topic and all its questions?')) return;
    
    try {
      const res = await fetch(`/api/topics?id=${topicId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-white/60">Welcome, {currentUser?.displayName}</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition backdrop-blur-xl border border-white/20"
          >
            ← Back to App
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-blue-500 to-cyan-500' },
            { label: 'Topics', value: stats.totalTopics, icon: '📚', color: 'from-purple-500 to-pink-500' },
            { label: 'Questions', value: stats.totalQuestions, icon: '❓', color: 'from-orange-500 to-red-500' },
            { label: 'Answers', value: stats.totalAnswers, icon: '✅', color: 'from-green-500 to-emerald-500' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="text-white/60 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-2 mb-6 border border-white/10 flex gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'topics', label: 'Topics', icon: '📚' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">System Overview</h2>
            <div className="space-y-4 text-white/80">
              <p>✅ Authentication system active</p>
              <p>✅ Role-based access control enabled</p>
              <p>✅ Session management configured</p>
              <p>📊 Platform running smoothly</p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.display_name || user.username}</p>
                            <p className="text-white/40 text-sm">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/80 text-sm">{user.email}</td>
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          disabled={user.id === currentUser?.id}
                          className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white text-sm disabled:opacity-50"
                        >
                          <option value="user">User</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Topic Management</h2>
            </div>
            <div className="p-6 space-y-4">
              {topics.map((topic) => (
                <div key={topic.id} className="bg-white/5 rounded-xl p-5 border border-white/10 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">{topic.name}</h3>
                    <p className="text-white/60 text-sm mb-2">{topic.description}</p>
                    <div className="flex gap-4 text-xs text-white/40">
                      <span>📝 {topic.question_count} questions</span>
                      <span>📅 {new Date(topic.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTopic(topic.id)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition border border-red-500/30"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
