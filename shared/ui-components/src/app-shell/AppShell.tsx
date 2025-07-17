import React, { useState } from 'react';

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

const defaultServices = [
  { name: 'Network', key: 'network' },
  { name: 'API', key: 'api' },
  { name: 'Database', key: 'db' },
  { name: 'Auth', key: 'auth' },
  { name: 'Storage', key: 'storage' },
];

const AppShell: React.FC<AppShellProps> = ({ children, className = '' }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [results, setResults] = useState<{ [key: string]: boolean } | null>(null);
  const [networkMs, setNetworkMs] = useState<number | null>(null);

  // Overall status: true = all green, false = any red
  const overallStatus = results ? Object.values(results).every(Boolean) : true;

  // Simulate diagnosis (could be replaced with real checks)
  const runDiagnosis = async () => {
    setDiagnosing(true);
    setResults(null);
    setNetworkMs(null);

    // Network check
    let networkOk = false;
    let pingMs: number | null = null;

    if (navigator.onLine) {
      const start = Date.now();
      try {
        // Use a fast, reliable endpoint (Google DNS)
        await fetch('https://dns.google/resolve?name=example.com', {
          method: 'GET',
          cache: 'no-store',
        });
        pingMs = Date.now() - start;
        networkOk = true;
      } catch {
        networkOk = false;
      }
    }

    setNetworkMs(networkOk && pingMs !== null ? pingMs : null);

    // Simulate async checks for other services
    setTimeout(() => {
      // For demo, randomly fail one non-network service 20% of the time
      const failIndex =
        Math.random() < 0.2 ? 1 + Math.floor(Math.random() * (defaultServices.length - 1)) : -1;

      const newResults: { [key: string]: boolean } = { network: networkOk };
      defaultServices.slice(1).forEach((svc, idx) => {
        newResults[svc.key] = failIndex === idx + 1 ? false : true;
      });

      setResults(newResults);
      setDiagnosing(false);
    }, 1200);
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-gray-50 font-sans ${className}`}
      style={{
        background: 'var(--gray-1)',
        fontFamily: 'Inter, ui-sans-serif, system-ui',
      }}
    >
      {/* Static Header */}
      <div
        className="fixed top-0 left-0 w-full z-40 bg-white border-b border-gray-200 shadow-sm"
        style={{
          borderBottom: '1px solid var(--gray-1)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">AI-BOS</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setModalOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="System Status"
            >
              <div
                className={`w-3 h-3 rounded-full ${overallStatus ? 'bg-green-500' : 'bg-red-500'}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main content, offset by header height and footer height */}
      <main
        className="flex-1 flex flex-col items-center w-full pt-16 pb-10 min-h-0"
        style={{
          paddingTop: 64, // header height
          paddingBottom: 40, // footer height
        }}
      >
        <div
          className="w-full max-w-4xl mx-auto p-6 box-border min-h-96 flex flex-col gap-6 bg-white shadow-md rounded-lg"
          style={{
            margin: 'var(--space-lg) auto',
            padding: 'var(--space-lg)',
            boxSizing: 'border-box',
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-lg)',
            background: 'var(--white)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {children}
        </div>
      </main>

      {/* System Status Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 text-2xl bg-none border-none cursor-pointer hover:text-gray-700"
              aria-label="Close"
              onClick={() => setModalOpen(false)}
            >
              ×
            </button>

            <h2 className="text-2xl font-semibold text-gray-900 mb-1">System Status</h2>

            <p className={`mb-6 text-sm ${overallStatus ? 'text-green-600' : 'text-red-600'}`}>
              {overallStatus ? 'All systems operational' : 'Issues detected'}
            </p>

            <ul className="mb-6 p-0 list-none">
              {defaultServices.map((svc) => (
                <li key={svc.key} className="flex items-center justify-between mb-3">
                  <span className="text-gray-800">{svc.name}</span>
                  {svc.key === 'network' ? (
                    diagnosing ? (
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 min-w-8 text-right">…</span>
                        <span className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" />
                      </span>
                    ) : results ? (
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 min-w-8 text-right">
                          {results[svc.key] && networkMs !== null ? `${networkMs} ms` : 'N/A'}
                        </span>
                        <span
                          className={`w-3 h-3 rounded-full ${
                            results[svc.key] ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          title={results[svc.key] ? 'Online' : 'Offline'}
                        />
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 min-w-8 text-right">—</span>
                        <span className="w-3 h-3 rounded-full bg-gray-200" />
                      </span>
                    )
                  ) : diagnosing ? (
                    <span className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" />
                  ) : results ? (
                    <span
                      className={`w-3 h-3 rounded-full ${
                        results[svc.key] ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      title={results[svc.key] ? 'Operational' : 'Issue'}
                    />
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-gray-200" />
                  )}
                </li>
              ))}
            </ul>

            <button
              className="w-full h-11 rounded-lg bg-blue-600 text-white font-medium text-base border-none cursor-pointer opacity-100 disabled:opacity-60"
              onClick={runDiagnosis}
              disabled={diagnosing}
            >
              {diagnosing ? 'Running system checks…' : 'Run Diagnosis'}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 py-2"
        style={{
          borderTop: '1px solid var(--gray-1)',
          boxShadow: '0 -1px 4px rgba(0,0,0,0.02)',
        }}
      >
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>AI-BOS Platform</span>
            <span>•</span>
            <span>v1.0.0</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
            >
              <div
                className={`w-2 h-2 rounded-full ${overallStatus ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <span>Status</span>
            </button>
            <span>•</span>
            <span>© 2024 AI-BOS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
