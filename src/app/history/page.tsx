'use client';
import { useEffect, useState } from 'react';

type Record = {
  id: number; question_id: number; question: string; topic: string;
  selected: string; correct_answer: string; is_correct: number;
  explanation: string; answered_at: string;
};

export default function HistoryPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct'>('all');

  useEffect(() => {
    fetch('/api/answers').then(r => r.json()).then(setRecords);
  }, []);

  const total = records.length;
  const correct = records.filter(r => r.is_correct).length;
  const wrong = total - correct;

  const filtered = filter === 'all' ? records
    : filter === 'wrong' ? records.filter(r => !r.is_correct)
    : records.filter(r => r.is_correct);

  // Group by date
  const grouped = new Map<string, Record[]>();
  for (const r of filtered) {
    const date = new Date(r.answered_at + 'Z').toLocaleDateString('en-GB', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
    if (!grouped.has(date)) grouped.set(date, []);
    grouped.get(date)!.push(r);
  }

  return (
    <div>
      <div className="mb-6">
        <a href="/" className="text-sm text-blue-600 hover:underline mb-2 inline-block">← Back to topics</a>
        <h1 className="text-2xl font-bold">Answer History</h1>
      </div>

      {total > 0 && (
        <div className="mb-4 flex flex-wrap gap-3 items-center">
          <div className="flex gap-2 text-sm">
            <span className="bg-gray-100 px-3 py-1 rounded-lg">Total: <b>{total}</b></span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg">✅ {correct}</span>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg">❌ {wrong}</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg">
              {Math.round(correct / total * 100)}%
            </span>
          </div>
          <div className="flex gap-1 text-xs">
            {(['all', 'wrong', 'correct'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg capitalize ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-gray-400 py-10 text-center">No answers yet.</p>
      ) : (
        <div className="space-y-6">
          {[...grouped.entries()].map(([date, items]) => (
            <div key={date}>
              <h3 className="text-xs text-gray-400 font-medium mb-2 sticky top-0 bg-gray-50 py-1">
                {date} — {items.filter(r => !r.is_correct).length} wrong / {items.length} total
              </h3>
              <div className="space-y-2">
                {items.map(r => (
                  <a key={r.id} href={`/quiz/${r.question_id}`}
                    className={`block p-3 rounded-lg border text-sm ${r.is_correct ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{r.topic}</span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(r.answered_at + 'Z').toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-medium mb-1">{r.question}</p>
                    <p className="text-xs text-gray-500">
                      You: <b>{r.selected}</b>
                      {!r.is_correct && <span> → Correct: <b className="text-green-700">{r.correct_answer}</b></span>}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
