interface AudioFeaturesDisplayProps {
  features: {
    tempo?: number
    keyName?: string
    key?: number
    energy?: number
    danceability?: number
    valence?: number
    acousticness?: number
    instrumentalness?: number
    liveness?: number
    speechiness?: number
    loudness?: number
  } | null
}

export default function AudioFeaturesDisplay({ features }: AudioFeaturesDisplayProps) {
  if (!features) {
    return (
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Analiza utworu</h3>
        <p className="text-gray-500 text-center py-8">
          Analiza audio nie jest dostępna dla tego utworu
        </p>
      </div>
    )
  }

  const bars = [
    { label: 'Energia', value: features.energy ?? 0, color: 'bg-red-500', description: 'Intensywność i aktywność' },
    { label: 'Taneczność', value: features.danceability ?? 0, color: 'bg-purple-500', description: 'Jak bardzo nadaje się do tańca' },
    { label: 'Nastrój (Valence)', value: features.valence ?? 0, color: 'bg-yellow-500', description: 'Pozytywność brzmienia' },
    { label: 'Akustyczność', value: features.acousticness ?? 0, color: 'bg-blue-500', description: 'Prawdopodobieństwo akustycznego nagrania' },
    { label: 'Instrumentalność', value: features.instrumentalness ?? 0, color: 'bg-green-500', description: 'Brak wokalu' },
    { label: 'Żywość (Liveness)', value: features.liveness ?? 0, color: 'bg-orange-500', description: 'Czy nagranie jest z koncertu' },
    { label: 'Mowa (Speechiness)', value: features.speechiness ?? 0, color: 'bg-pink-500', description: 'Ilość słów mówionych' },
  ].filter(bar => bar.value > 0.01)

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">🎵 Analiza utworu</h3>
      
      {/* Kluczowe statystyki */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-primary-400">
            {features.tempo ? Math.round(features.tempo) : '—'}
          </p>
          <p className="text-sm text-gray-400">BPM (Tempo)</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <p className="text-xl font-bold text-primary-400">
            {features.keyName || '—'}
          </p>
          <p className="text-sm text-gray-400">Tonacja</p>
        </div>
      </div>

      {features.loudness !== undefined && (
        <div className="bg-gray-800 rounded-lg p-3 mb-6 text-center">
          <span className="text-gray-400 text-sm">Głośność: </span>
          <span className="text-white font-semibold">{features.loudness.toFixed(1)} dB</span>
        </div>
      )}

      {/* Paski cech */}
      <div className="space-y-4">
        {bars.map((bar) => (
          <div key={bar.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400" title={bar.description}>{bar.label}</span>
              <span className="text-white font-medium">{Math.round(bar.value * 100)}%</span>
            </div>
            <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${bar.color} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${bar.value * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

