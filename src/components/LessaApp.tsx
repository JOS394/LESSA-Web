'use client';
import { useState, useEffect } from 'react';
import { lessaData } from '../data/lessaData';

type Entry = {
  id: number;
  word: string;
  category: string;
  difficulty: 'fácil' | 'medio' | 'difícil';
  description: string;
  image: string;
  choices: string[];
};

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const useProgress = () => {
  const [progress, setProgress] = useState({
    studiedWords: new Set<number>(),
    correctAnswers: 0,
    totalQuestions: 0,
    streakCount: 0
  });
  return {
    progress,
    markWordStudied: (id: number) => setProgress(p => ({...p, studiedWords: new Set([...p.studiedWords, id])})),
    updateQuizStats: (ok: boolean, streak: number) => setProgress(p => ({...p, correctAnswers: ok? p.correctAnswers+1:p.correctAnswers, totalQuestions: p.totalQuestions+1, streakCount: streak})),
    resetProgress: () => setProgress({ studiedWords: new Set(), correctAnswers: 0, totalQuestions: 0, streakCount: 0 })
  }
}

function Home({ onViewChange, progress }: { onViewChange: (v: 'home' | 'flashcards' | 'quiz' | 'dictionary') => void, progress: any }) {
  const completion = Math.round((progress.studiedWords.size / lessaData.length) * 100);
  const accuracy = progress.totalQuestions ? Math.round((progress.correctAnswers / progress.totalQuestions) * 100) : 0;
  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Bienvenido a LESSA Web</h2>
        <p className="text-lg text-gray-600 max-w-2xl">Aprende el diccionario de la Lengua de Señas Salvadoreña (LESSA) de forma divertida y sencilla.</p>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Tu progreso</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{progress.studiedWords.size}</div>
            <div className="text-sm text-gray-600">Palabras estudiadas</div>
            <div className="text-xs text-gray-500">de {lessaData.length} total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
            <div className="text-sm text-gray-600">Precisión en quiz</div>
            <div className="text-xs text-gray-500">{progress.correctAnswers}/{progress.totalQuestions} correctas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{progress.streakCount}</div>
            <div className="text-sm text-gray-600">Racha actual</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <button onClick={() => onViewChange('flashcards')} className="p-6 bg-blue-600 text-white rounded-xl shadow hover:scale-105 transition">Tarjetas de estudio</button>
        <button onClick={() => onViewChange('quiz')} className="p-6 bg-green-600 text-white rounded-xl shadow hover:scale-105 transition">Cuestionario</button>
        <button onClick={() => onViewChange('dictionary')} className="p-6 bg-purple-600 text-white rounded-xl shadow hover:scale-105 transition">Diccionario</button>
      </div>
    </div>
  );
}

function Flashcards({ onViewChange, markWordStudied }: { onViewChange: (v: 'home' | 'flashcards' | 'quiz' | 'dictionary')=>void, markWordStudied: (id:number)=>void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const data = lessaData;
  const item = data[index];
  const next = () => { markWordStudied(item.id); setIndex((i)=> (i+1)%data.length); setFlipped(false); };
  const prev = () => { setIndex((i)=> (i-1+data.length)%data.length); setFlipped(false); };
  return (
    <div className="space-y-4">
      <button onClick={() => onViewChange('home')} className="text-blue-600 hover:underline">← Volver</button>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">{item.word} <span className="text-sm text-gray-500">({item.category})</span></h3>
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">{item.difficulty}</span>
        </div>
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <img src={item.image} alt={item.word} className="w-full rounded-lg border" />
          <div>
            <p className="text-gray-700 mb-4">{flipped ? item.description : 'Toca "Mostrar" para ver la descripción.'}</p>
            <div className="flex gap-2">
              <button onClick={() => setFlipped(!flipped)} className="px-4 py-2 rounded bg-blue-600 text-white">{flipped ? 'Ocultar' : 'Mostrar'}</button>
              <button onClick={prev} className="px-4 py-2 rounded bg-gray-100">Anterior</button>
              <button onClick={next} className="px-4 py-2 rounded bg-gray-900 text-white">Siguiente</button>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center text-sm text-gray-500">Tarjeta {index + 1} de {data.length}</div>
    </div>
  );
}

function Quiz({ onViewChange, updateQuizStats }: { onViewChange: (v: 'home' | 'flashcards' | 'quiz' | 'dictionary')=>void, updateQuizStats: (ok:boolean, streak:number)=>void }) {
  const [pool, setPool] = useState<Entry[]>([]);
  const [current, setCurrent] = useState<Entry | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  useEffect(() => { const s = shuffle(lessaData); setPool(s); setCurrent(s[0]); }, []);
  useEffect(() => {
    if (!current) return;
    const sameCat = lessaData.filter(d => d.category === current.category).map(d => d.word);
    let distractors = shuffle(sameCat.filter(w => w !== current.word)).slice(0,3);
    while (distractors.length < 3) distractors.push('Opción extra');
    setOptions(shuffle([current.word, ...distractors]));
  }, [current]);
  const answer = (opt: string) => {
    if (!current) return;
    const ok = opt === current.word;
    const nxtStreak = ok ? streak + 1 : 0;
    setStreak(nxtStreak);
    updateQuizStats(ok, nxtStreak);
    setFeedback(ok ? '✅ ¡Correcto!' : `❌ Incorrecto. Era "${current.word}"`);
    setTimeout(() => {
      setFeedback(null);
      const idx = pool.findIndex(p => p.id === current.id);
      setCurrent(pool[(idx + 1) % pool.length]);
    }, 800);
  };
  if (!current) return <div>Cargando...</div>;
  return (
    <div className="space-y-4">
      <button onClick={() => onViewChange('home')} className="text-blue-600 hover:underline">← Volver</button>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">¿Cuál es la palabra correcta?</h3>
          <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded">{current.category}</span>
        </div>
        <img src={current.image} alt={current.word} className="w-full rounded-lg border mb-6" />
        <div className="grid gap-3">
          {options.map((o, i) => (
            <button key={i} onClick={() => answer(o)} className="w-full text-left px-4 py-3 rounded border hover:bg-gray-50">{o}</button>
          ))}
        </div>
        {feedback && <div className="mt-3 text-sm">{feedback}</div>}
      </div>
    </div>
  );
}

function Dictionary() {
  const [q, setQ] = useState('');
  const filtered = lessaData.filter(d =>
    d.word.toLowerCase().includes(q.toLowerCase()) ||
    d.category.toLowerCase().includes(q.toLowerCase())
  );
  const cats = Array.from(new Set(lessaData.map(d => d.category)));
  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por palabra o categoría..." className="flex-1 rounded border px-3 py-2" />
        <select className="rounded border px-3 py-2" onChange={e => setQ(e.target.value)} defaultValue="">
          <option value="">Todas las categorías</option>
          {cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow p-4">
            <img src={item.image} alt={item.word} className="w-full h-40 object-cover rounded border" />
            <div className="mt-2 font-semibold">{item.word}</div>
            <div className="text-xs text-gray-500">{item.category} · {item.difficulty}</div>
            <p className="text-sm text-gray-700 mt-1 line-clamp-3">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LessaApp() {
  const [view, setView] = useState<'home' | 'flashcards' | 'quiz' | 'dictionary'>('home');
  const { progress, markWordStudied, updateQuizStats, resetProgress } = useProgress();
  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">LESSA Web</h1>
        <div className="flex gap-2 text-sm">
          <button onClick={() => setView('home')} className={`px-3 py-2 rounded ${view==='home'?'bg-gray-900 text-white':'bg-gray-100'}`}>Inicio</button>
          <button onClick={() => setView('flashcards')} className={`px-3 py-2 rounded ${view==='flashcards'?'bg-gray-900 text-white':'bg-gray-100'}`}>Tarjetas</button>
          <button onClick={() => setView('quiz')} className={`px-3 py-2 rounded ${view==='quiz'?'bg-gray-900 text-white':'bg-gray-100'}`}>Quiz</button>
          <button onClick={() => setView('dictionary')} className={`px-3 py-2 rounded ${view==='dictionary'?'bg-gray-900 text-white':'bg-gray-100'}`}>Diccionario</button>
          <button onClick={resetProgress} className="px-3 py-2 rounded bg-red-50 text-red-600">Reiniciar progreso</button>
        </div>
      </header>
      {view === 'home' && <Home onViewChange={setView} progress={progress} />}
      {view === 'flashcards' && <Flashcards onViewChange={setView} markWordStudied={markWordStudied} />}
      {view === 'quiz' && <Quiz onViewChange={setView} updateQuizStats={updateQuizStats} />}
      {view === 'dictionary' && <Dictionary />}
    </div>
  );
}
