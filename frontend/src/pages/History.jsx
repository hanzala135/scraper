import React, { useState, useEffect, useCallback } from 'react';
import { getHistory, getStats, getRun, deleteRun, clearHistory } from '../api';
import StatsBar from '../components/StatsBar';
import { NswCard, HounslowCard } from '../components/ResultCard';

const TASK_COLOR = { nsw: 'var(--nsw)', hounslow: 'var(--hou)', all: 'var(--all)' };
const TASK_LABEL = { nsw: 'NSW Planning', hounslow: 'Hounslow BC', all: 'All Tasks' };
const STATUS_COLOR = { success: 'var(--ok)', error: 'var(--err)', running: 'var(--warn)' };

const RunRow = ({ run, onSelect, onDelete, active }) => {
  const d = new Date(run.startedAt);
  const dateStr = `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;

  return (
    <div
      onClick={() => onSelect(run._id)}
      style={{
        background: active ? 'var(--sf2)' : 'transparent',
        border: `1px solid ${active ? 'var(--bd2)' : 'transparent'}`,
        borderRadius: '8px',
        padding: '12px 14px',
        cursor: 'pointer',
        transition: 'all .15s',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          flexShrink: 0,
          background: STATUS_COLOR[run.status] ?? 'var(--muted)',
          boxShadow: `0 0 6px ${STATUS_COLOR[run.status] ?? 'transparent'}`,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>
          <span style={{ color: TASK_COLOR[run.task] }}>{TASK_LABEL[run.task]}</span>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
          {dateStr} · {run.recordCount ?? 0} records
          {run.duration ? ` · ${(run.duration / 1000).toFixed(1)}s` : ''}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(run._id);
        }}
        style={{
          background: 'none',
          border: '1px solid var(--bd2)',
          color: 'var(--muted)',
          fontSize: '10px',
          padding: '3px 8px',
          borderRadius: '5px',
        }}
      >
        ✕
      </button>
    </div>
  );
};

const History = () => {
  const [runs, setRuns] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [h, s] = await Promise.all([getHistory(), getStats()]);
      setRuns(h.data ?? []);
      setStats(s.data ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSelect = async (id) => {
    if (id === activeId) {
      setActiveId(null);
      setDetail(null);
      return;
    }

    setActiveId(id);
    setLoadingDetail(true);

    try {
      const res = await getRun(id);
      setDetail(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteRun(id);
    if (id === activeId) {
      setActiveId(null);
      setDetail(null);
    }
    fetchAll();
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete all history?')) return;
    await clearHistory();
    setActiveId(null);
    setDetail(null);
    fetchAll();
  };

  return (
    <div
      style={{
        height: '100vh',          // ✅ FULL SCREEN
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <StatsBar stats={stats} />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '12px 28px',
        }}
      >
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
          Scrape History
        </div>

        {runs.length > 0 && (
          <button
            onClick={handleClearAll}
            style={{
              background: 'rgba(255,95,109,.1)',
              border: '1px solid var(--err)',
              color: 'var(--err)',
              fontSize: '10px',
              padding: '4px 12px',
              borderRadius: '5px',
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',   // ✅ SCROLL ENABLED HERE
          padding: '0 28px 24px',
        }}
      >
        {loading && <div style={{ color: 'var(--muted)' }}>Loading…</div>}

        {!loading && runs.length === 0 && (
          <div style={{ color: 'var(--muted)', textAlign: 'center', marginTop: '40px' }}>
            No scrape runs yet.
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: activeId ? '340px 1fr' : '1fr',
            gap: '16px',
          }}
        >
          {/* LEFT LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {runs.map((r) => (
              <RunRow
                key={r._id}
                run={r}
                active={r._id === activeId}
                onSelect={handleSelect}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* RIGHT DETAIL */}
          {activeId && (
            <div style={{ overflowY: 'auto' }}>
              {loadingDetail && <div style={{ color: 'var(--muted)' }}>Loading…</div>}

              {detail && !loadingDetail && (
                <>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '14px' }}>
                    {TASK_LABEL[detail.task]} —{' '}
                    {new Date(detail.startedAt).toLocaleString()}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                      gap: '10px',
                    }}
                  >
                    {(detail.results?.nswPlanning ?? []).map((a, i) => (
                      <NswCard key={i} app={a} />
                    ))}

                    {(detail.results?.hounslowBuilding ?? []).map((a, i) => (
                      <HounslowCard key={i} app={a} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;