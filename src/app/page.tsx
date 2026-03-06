'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchTopics();
  }, []);

  const checkAuth = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  };

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/topics');
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      }
    } catch (err) {
      console.error('Failed to fetch topics');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  // Not logged in - show login prompt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📚</div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              MC Practice Platform
            </h1>
            <p className="text-gray-600">請先登入以使用練習平台</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/auth')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              🔐 登入 / 註冊
            </button>

            <div className="text-center text-sm text-gray-500">
              <p>測試帳號：</p>
              <p className="font-mono bg-gray-100 rounded px-2 py-1 mt-1">
                admin / admin123
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-2xl mb-1">📝</div>
                <div className="text-gray-600">題庫練習</div>
              </div>
              <div>
                <div className="text-2xl mb-1">📊</div>
                <div className="text-gray-600">答題記錄</div>
              </div>
              <div>
                <div className="text-2xl mb-1">🔍</div>
                <div className="text-gray-600">Google 搜尋</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in - show main content
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow p-4 mb-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex gap-4">
            <a href="/" className="font-bold text-blue-600">MC Practice</a>
            <a href="/history" className="text-gray-600 hover:text-blue-600">History</a>
            {user.role === 'admin' && (
              <a href="/admin" className="text-purple-600 hover:text-purple-700 font-semibold">
                👑 Admin
              </a>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-gray-600">歡迎，</span>
              <span className="font-semibold text-gray-900">{user.display_name || user.username}</span>
              {user.role === 'admin' && (
                <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                  Admin
                </span>
              )}
              {user.role === 'moderator' && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Mod
                </span>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              登出
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">題庫列表</h1>
            <button 
              onClick={() => router.push('/topics/upload')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Upload PDF
            </button>
          </div>

          {topics.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-400 mb-3">尚未有題庫</p>
              <button 
                onClick={() => router.push('/topics/upload')}
                className="text-blue-600 hover:underline text-sm"
              >
                上傳你的第一個 PDF →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic: any) => (
                <div
                  key={topic.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/quiz/${topic.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {topic.name}
                      </h3>
                      {topic.description && (
                        <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📝 {topic.question_count || 0} 題</span>
                        <span>📅 {new Date(topic.created_at).toLocaleDateString('zh-HK')}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/quiz/${topic.id}`);
                      }}
                      className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      開始練習 →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
