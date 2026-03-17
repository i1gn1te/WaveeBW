import React from 'react'

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
}

export default class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('Unhandled UI error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-6">
          <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <h1 className="text-xl font-semibold mb-2">Wystąpił błąd aplikacji</h1>
            <p className="text-gray-400 mb-5">
              Spróbuj odświeżyć stronę. Jeśli problem wraca, wyczyść cache przeglądarki.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition"
            >
              Odśwież stronę
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
