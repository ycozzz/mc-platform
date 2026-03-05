'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

type Question = {
  id: number; topic_id: number; question: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
};

type Topic = {
  id: number; name: string; description: string;
};

export default function TopicPage() {
  const { id } = useParams();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<{total: number; correct: number}>({ total: 0, correct: 0 });

  useEffect(() => {
    fetch('/api/topics').then(r => r.json()).then((topics: Topic[]) => {
      setTopic(topics.find(t => t.id === Number(id)) || null);
    });
    fetch(`/api/topics/${id}/questions`).then(r => r.json()).then(setQuestions);
    fetch('/api/answers').then(r => r.json()).then((ans: any[]) => {
      const filtered = ans.filter(a => questions.some(q => q.id === a.question_id));
      setStats({ total: filtered.length, correct: filtered.filter(a => a.is_correct).length });
    });
  }, [id]);

  const startRandom = () => {
    if (!questions.length) return;
    const q = questions[Math.floor(Math.random() * questions.length)];
    window.location.href = `/quiz/${q.id}`;
  };

  if (!topic) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <a href="/" className="text-sm text-blue-600 hover:underline mb-2 inline-block">← Back to all topics</a>
        <h1 className="text-2xl font-bold">{topic.name}</h1>
        {topic.description && <p className="text-gray-600 text-sm mt-1">{topic.description}</p>}
      </div>

      {stats.total > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-5 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Answered <b className="text-gray-800">{stats.total}</b> questions —
            <span className="text-green-600 ml-1">{stats.correct} correct</span>,
            <span className="text-red-500 ml-1">{stats.total - stats.correct} wrong</span>
            <span className="ml-1">({stats.total ? Math.round(stats.correct / stats.total * 100) : 0}%)</span>
          </div>
          <a href="/history" className="text-xs text-blue-600 hover:underline">View history →</a>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{questions.length} Questions</h2>
        <button onClick={startRandom}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          🎲 Random
        </button>
      </div>

      {questions.length === 0 ? (
        <p className="text-gray-400 py-10 text-center">No questions in this topic.</p>
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <a key={q.id} href={`/quiz/${q.id}`}
              className="block bg-white p-3.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-sm transition text-sm">
              <span className="text-gray-300 mr-2">#{i + 1}</span>
              {q.question}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
