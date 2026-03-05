'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if already logged in
    const user = localStorage.getItem('user');
    if (user) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' 
        ? { username: formData.username, password: formData.password }
        : formData;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      if (mode === 'register') {
        setMode('login');
        setError('');
        setFormData({ ...formData, password: '' });
      } else {
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Glassmorphism Card */}
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-2xl bg-white/10 rounded-[2.5rem] border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative px-8 pt-12 pb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10" />
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/50 transform hover:scale-110 transition-transform duration-300">
                <span className="text-4xl">🎓</span>
              </div>
              <h1 className="text-3xl font-bold text-center text-white mb-2">
                MC Practice
              </h1>
              <p className="text-center text-white/60 text-sm">
                Master your knowledge
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="px-8 mb-6">
            <div className="relative bg-white/5 rounded-2xl p-1 backdrop-blur-xl border border-white/10">
              <div 
                className="absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl transition-all duration-300 ease-out shadow-lg"
                style={{ left: mode === 'login' ? '0.25rem' : 'calc(50% + 0.25rem)' }}
              />
              <div className="relative flex">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-colors duration-300 ${mode === 'login' ? 'text-white' : 'text-white/50'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-colors duration-300 ${mode === 'register' ? 'text-white' : 'text-white/50'}`}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 backdrop-blur-xl animate-shake">
                <p className="text-red-200 text-sm text-center">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <input
                  type="text"
                  placeholder="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  className="relative w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-blue-500/50 focus:bg-white/15 transition-all duration-300"
                />
              </div>

              {mode === 'register' && (
                <>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="relative w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-blue-500/50 focus:bg-white/15 transition-all duration-300"
                    />
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <input
                      type="text"
                      placeholder="Display Name (optional)"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="relative w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-blue-500/50 focus:bg-white/15 transition-all duration-300"
                    />
                  </div>
                </>
              )}

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="relative w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-white/40 backdrop-blur-xl focus:outline-none focus:border-blue-500/50 focus:bg-white/15 transition-all duration-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full mt-6 group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative py-4 px-6 font-semibold text-white flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <span className="text-xl group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 text-center">
            <p className="text-white/40 text-xs">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              {' '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-3xl blur-2xl animate-float" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-3xl blur-2xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
