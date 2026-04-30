import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <header className="mb-12">
        <h1 className="text-5xl font-bold mb-2">🎮 Vantage Point</h1>
        <p className="text-xl text-slate-400">Spatial Intelligence Platform for Competitive Gamers</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="bg-slate-700 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Welcome to Vantage Point</h2>
          <p className="text-slate-300 mb-6">
            Transform your gameplay through advanced positioning analysis.
          </p>
          <button
            onClick={() => setCount(count + 1)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-semibold"
          >
            Counter: {count}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">📍 Spatial Tracking</h3>
            <p className="text-slate-300">Process coordinate data for deaths and kills</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">🤖 AI Positioning</h3>
            <p className="text-slate-300">ML predictions for optimal positioning</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">👻 Ghost Player</h3>
            <p className="text-slate-300">Real-time overlay recommendations</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">📊 Analytics</h3>
            <p className="text-slate-300">Identify patterns and mistakes</p>
          </div>
        </div>
      </main>

      <footer className="mt-12 pt-8 border-t border-slate-600 text-center text-slate-400">
        <p>Backend API: <code className="bg-slate-800 px-2 py-1 rounded">http://localhost:8000</code></p>
      </footer>
    </div>
  )
}

export default App
