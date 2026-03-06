'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Question = {
  id: number; topic_id: number; question: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
};

type Result = { is_correct: boolean; correct_answer: string; explanation: string };

type AnswerRecord = {
  questionId: number;
  isCorrect: boolean;
};

export default function QuizPage() {
  const { id } = useParams();
  const router = useRouter();
  const [q, setQ] = useState<Question | null>(null);
  const [allIds, setAllIds] = useState<number[]>([]);
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [answerRecords, setAnswerRecords] = useState<Map<number, boolean>>(new Map());

  useEffect(() => {
    fetch('/api/questions').then(r => r.json()).then((qs: Question[]) => {
      setQ(qs.find(x => x.id === Number(id)) || null);
      setAllIds(qs.map(x => x.id));
    });
    
    // Load answer records from localStorage
    const records = localStorage.getItem('answerRecords');
    if (records) {
      const parsed = JSON.parse(records);
      setAnswerRecords(new Map(parsed));
    }
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
    
    // Record answer result
    const newRecords = new Map(answerRecords);
    newRecords.set(Number(id), data.is_correct);
    setAnswerRecords(newRecords);
    localStorage.setItem('answerRecords', JSON.stringify([...newRecords]));
  };

  const openGoogleAI = () => {
    if (!q || !result) return;
    const options = [
      ['A', q.option_a], ['B', q.option_b],
      ['C', q.option_c], ['D', q.option_d],
    ].filter(([, v]) => v && v !== '-');
    const query = `${q.question} ${options.map(([k, v]) => `${k}. ${v}`).join(' ')}`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&udm=50`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const goToQuestion = (qId: number) => {
    setSelected('');
    setResult(null);
    router.push(`/quiz/${qId}`);
  };

  const nextQuestion = () => {
    const curIdx = allIds.indexOf(Number(id));
    const nextId = allIds[curIdx + 1] || allIds[0];
    goToQuestion(nextId);
  };

  const curIdx = allIds.indexOf(Number(id));

  if (!q) return <div className="flex justify-center py-20"><p className="text-gray-400">Loading...</p></div>;

  const options = [
    ['A', q.option_a], ['B', q.option_b],
    ['C', q.option_c], ['D', q.option_d],
  ].filter(([, v]) => v && v !== '-');

  // Calculate stats
  const answeredCount = answerRecords.size;
  const correctCount = [...answerRecords.values()].filter(v => v).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Question Grid Navigator */}
      <div className="w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <div className="mb-4">
          <a href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            <span>←</span> Back to Topics
          </a>
        </div>
        
        {/* Stats */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Progress</div>
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-bold text-gray-900">{answeredCount}</span>
              <span className="text-gray-500"> / {allIds.length}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs text-gray-600">{correctCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs text-gray-600">{answeredCount - correctCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Grid */}
        <div className="mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Questions</h3>
        </div>
        
        <div className="grid grid-cols-5 gap-2">
          {allIds.map((qId, idx) => {
            const isCurrent = qId === Number(id);
            const answerResult = answerRecords.get(qId);
            const isAnswered = answerResult !== undefined;
            const isCorrect = answerResult === true;
            const isWrong = answerResult === false;
            
            return (
              <button
                key={qId}
                onClick={() => goToQuestion(qId)}
                className={`relative w-full aspect-square rounded-lg text-sm font-semibold transition-all transform hover:scale-110
                  ${isCurrent 
                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-300 ring-offset-2' 
                    : isCorrect
                      ? 'bg-green-500 text-white shadow-md hover:bg-green-600'
                      : isWrong
                        ? 'bg-red-500 text-white shadow-md hover:bg-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                  }`}
                title={`Question ${idx + 1}${isCorrect ? ' - Correct' : isWrong ? ' - Wrong' : ''}`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {idx + 1}
                </div>
                {isCorrect && (
                  <div className="absolute top-0.5 right-0.5 text-xs">✓</div>
                )}
                {isWrong && (
                  <div className="absolute top-0.5 right-0.5 text-xs">✗</div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">1</div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">2</div>
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">3</div>
              <span>Wrong</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-gray-600 text-xs font-bold">4</div>
              <span>Not answered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                Question {curIdx + 1} / {allIds.length}
              </span>
              {answerRecords.has(Number(id)) && (
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  answerRecords.get(Number(id)) 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {answerRecords.get(Number(id)) ? '✓ Correct' : '✗ Wrong'}
                </span>
              )}
            </div>
            
            <h2 className="text-lg font-semibold mb-5 leading-relaxed">{q.question}</h2>

            <div className="space-y-2.5">
              {options.map(([key, val]) => (
                <button 
                  key={key} 
                  onClick={() => !result && setSelected(key)}
                  className={`w-full text-left p-3.5 rounded-lg border-2 transition-all text-sm
                    ${result
                      ? key === result.correct_answer
                        ? 'bg-green-50 border-green-400 text-green-800'
                        : key === selected && !result.is_correct
                          ? 'bg-red-50 border-red-400 text-red-800'
                          : 'border-gray-100 text-gray-400'
                      : selected === key
                        ? 'bg-blue-50 border-blue-400 text-blue-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <span className="font-semibold mr-2 inline-block w-5">{key}.</span>{val}
                </button>
              ))}
            </div>

            {!result ? (
              <button 
                onClick={submit} 
                disabled={!selected}
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg disabled:opacity-30 transition font-medium"
              >
                Submit Answer
              </button>
            ) : (
              <div className="mt-5 space-y-3">
                <div className={`p-4 rounded-lg ${result.is_correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className="font-semibold text-sm">
                    {result.is_correct ? '✅ Correct!' : `❌ Wrong — Correct answer: ${result.correct_answer}`}
                  </p>
                  {result.explanation && (
                    <p className="mt-2 text-xs text-gray-600 leading-relaxed max-h-40 overflow-y-auto">{result.explanation}</p>
                  )}
                  
                  <button
                    onClick={openGoogleAI}
                    className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2"
                  >
                    <span>🔍</span>
                    <span>Google AI Search</span>
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => router.push('/')}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm"
                  >
                    ← Back
                  </button>
                  <button 
                    onClick={nextQuestion}
                    className="flex-1 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                  >
                    Next Question →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
