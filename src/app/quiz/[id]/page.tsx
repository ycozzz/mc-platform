'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Question = {
  id: number; topic_id: number; question: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
};

type Result = { is_correct: boolean; correct_answer: string; explanation: string };

export default function QuizPage() {
  const { id } = useParams();
  const router = useRouter();
  const [q, setQ] = useState<Question | null>(null);
  const [allIds, setAllIds] = useState<number[]>([]);
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    fetch('/api/questions').then(r => r.json()).then((qs: Question[]) => {
      setQ(qs.find(x => x.id === Number(id)) || null);
      setAllIds(qs.map(x => x.id));
    });
  }, [id]);

  const submit = async () => {
    if (!selected) return;
    const res = await fetch('/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question_id: Number(id), selected }),
    });
    const data = await res.json();
    setResult(data);
    
    // Auto-open Google AI search after 800ms
    setTimeout(() => setShowIframe(true), 800);
  };

  const nextQuestion = () => {
    const curIdx = allIds.indexOf(Number(id));
    const nextId = allIds[curIdx + 1] || allIds[0];
    setSelected('');
    setResult(null);
    setShowIframe(false);
    router.push(`/quiz/${nextId}`);
  };

  const curIdx = allIds.indexOf(Number(id));
  const progress = allIds.length > 0 ? ((curIdx + 1) / allIds.length) * 100 : 0;

  if (!q) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 text-sm">Loading question...</p>
      </div>
    </div>
  );

  const options = [
    ['A', q.option_a], ['B', q.option_b],
    ['C', q.option_c], ['D', q.option_d],
  ].filter(([, v]) => v && v !== '-');

  // Build Google AI search query with question + all options
  const googleQuery = `${q.question} ${options.map(([k, v]) => `${k}. ${v}`).join(' ')}`;
  const googleSearchUrl = result 
    ? `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}&udm=50`
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <a href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition">
              <span>←</span> Back to Topics
            </a>
            <span className="text-sm font-semibold text-gray-700">
              Question {curIdx + 1} <span className="text-gray-400">/ {allIds.length}</span>
            </span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-xl font-bold text-white leading-relaxed">{q.question}</h2>
          </div>

          <div className="p-8 space-y-3">
            {options.map(([key, val]) => {
              const isCorrect = result && key === result.correct_answer;
              const isWrong = result && key === selected && !result.is_correct;
              const isSelected = !result && selected === key;
              
              return (
                <button 
                  key={key} 
                  onClick={() => !result && setSelected(key)}
                  disabled={!!result}
                  className={`group w-full text-left p-5 rounded-xl border-2 transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100
                    ${isCorrect 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-lg shadow-green-100' 
                      : isWrong
                        ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-400 shadow-lg shadow-red-100'
                        : isSelected
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500 shadow-lg shadow-blue-100'
                          : result
                            ? 'border-gray-200 bg-gray-50 opacity-60'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-all
                      ${isCorrect
                        ? 'bg-green-500 text-white'
                        : isWrong
                          ? 'bg-red-500 text-white'
                          : isSelected
                            ? 'bg-blue-500 text-white'
                            : result
                              ? 'bg-gray-300 text-gray-500'
                              : 'bg-gray-100 text-gray-700 group-hover:bg-blue-500 group-hover:text-white'
                      }`}>
                      {key}
                    </span>
                    <span className={`flex-1 text-sm leading-relaxed ${result && !isCorrect && !isWrong ? 'text-gray-400' : 'text-gray-800'}`}>
                      {val}
                    </span>
                    {isCorrect && <span className="text-green-600 text-xl">✓</span>}
                    {isWrong && <span className="text-red-600 text-xl">✗</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          {!result && (
            <div className="px-8 pb-8">
              <button 
                onClick={submit} 
                disabled={!selected}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                Submit Answer
              </button>
            </div>
          )}

          {/* Result Section */}
          {result && (
            <div className="px-8 pb-8 space-y-4 animate-fadeIn">
              <div className={`p-6 rounded-xl border-2 ${result.is_correct ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-3xl ${result.is_correct ? 'animate-bounce' : 'animate-shake'}`}>
                    {result.is_correct ? '🎉' : '💡'}
                  </span>
                  <div>
                    <p className={`font-bold text-lg ${result.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                      {result.is_correct ? 'Correct!' : 'Not quite right'}
                    </p>
                    {!result.is_correct && (
                      <p className="text-sm text-gray-600 mt-1">
                        The correct answer is <span className="font-bold text-green-600">{result.correct_answer}</span>
                      </p>
                    )}
                  </div>
                </div>

                {result.explanation && (
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Explanation</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{result.explanation}</p>
                  </div>
                )}

                <button 
                  onClick={() => setShowIframe(!showIframe)}
                  className="mt-4 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span className="text-lg">🔍</span>
                  <span>{showIframe ? 'Hide' : 'Show'} Google AI Explanation</span>
                </button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => router.push('/')}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  ← Back to Topics
                </button>
                <button 
                  onClick={nextQuestion}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Next Question →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Google Search Iframe */}
        {showIframe && result && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slideDown">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <span className="text-xl">🔍</span>
                <div>
                  <span className="font-semibold block">Google AI Search Results</span>
                  <span className="text-xs text-white/80">Question + All Options</span>
                </div>
              </div>
              <button 
                onClick={() => setShowIframe(false)}
                className="text-white/80 hover:text-white text-xl font-bold transition"
              >
                ✕
              </button>
            </div>
            <iframe
              src={googleSearchUrl}
              className="w-full h-[700px] border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              title="Google Search Results"
            />
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideDown { animation: slideDown 0.4s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>
    </div>
  );
}
