'use client';
import { useEffect, useState } from 'react';

type Topic = {
  id: number; name: string; description: string;
  question_count: number; answer_count: number; correct_count: number;
  created_at: string;
};

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadTopics = () => {
    fetch('/api/topics').then(r => r.json()).then(setTopics);
  };

  useEffect(() => { loadTopics(); }, []);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Imported ${data.imported} questions`);
        form.reset();
        setShowUpload(false);
        loadTopics();
      } else {
        alert('❌ ' + data.error);
      }
    } catch (err: any) {
      alert('❌ ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">MC Practice Platform</h1>
        <button onClick={() => setShowUpload(!showUpload)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Upload PDF
        </button>
      </div>

      {showUpload && (
        <form onSubmit={handleUpload} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h3 className="font-semibold mb-3">Upload Question Bank</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Topic Name *</label>
              <input name="topicName" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. CyberArk PAM-DEF" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Description</label>
              <input name="description"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Optional description" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">PDF File *</label>
              <input type="file" name="file" accept=".pdf" required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Upload & Import'}
            </button>
            <button type="button" onClick={() => setShowUpload(false)}
              className="border border-gray-200 px-4 py-2 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {topics.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-3">No question banks yet</p>
          <button onClick={() => setShowUpload(true)}
            className="text-blue-600 hover:underline text-sm">
            Upload your first PDF →
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {topics.map(t => {
            const accuracy = t.answer_count > 0 ? Math.round((t.correct_count / t.answer_count) * 100) : 0;
            return (
              <a key={t.id} href={`/topics/${t.id}`}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition">
                <h3 className="font-semibold text-lg mb-1">{t.name}</h3>
                {t.description && <p className="text-xs text-gray-500 mb-3">{t.description}</p>}
                <div className="flex gap-3 text-xs text-gray-600">
                  <span>📝 {t.question_count} questions</span>
                  {t.answer_count > 0 && (
                    <>
                      <span>✅ {t.correct_count}/{t.answer_count}</span>
                      <span className={accuracy >= 70 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                        {accuracy}%
                      </span>
                    </>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
