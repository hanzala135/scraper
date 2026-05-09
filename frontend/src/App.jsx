import React, { useState, useCallback } from 'react';
import Header    from './components/Header';
import Dashboard from './pages/Dashboard';
import History   from './pages/History';

const App = () => {
  const [page,           setPage]           = useState('dashboard');
  const [historyRefresh, setHistoryRefresh] = useState(0);

  // Called when a scrape run completes — so History auto-refreshes
  const handleRunComplete = useCallback(() => {
    setHistoryRefresh(n => n + 1);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateRows: '56px 1fr', height: '100vh', overflow: 'hidden' }}>
      <Header page={page} setPage={setPage} />

      <main style={{ overflow: 'hidden' }}>
        {page === 'dashboard'
          ? <Dashboard onRunComplete={handleRunComplete} />
          : <History   key={historyRefresh} />
        }
      </main>
    </div>
  );
};

export default App;
