import React from 'react';

const Stat = ({ label, value, color }) => (
  <div style={{
    background: 'var(--sf)', border: '1px solid var(--bd)', borderRadius: '8px',
    padding: '14px 18px', flex: 1,
  }}>
    <div style={{ fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '6px' }}>
      {label}
    </div>
    <div style={{ fontSize: '24px', fontFamily: 'var(--sans)', fontWeight: 700, color: color ?? '#fff' }}>
      {value ?? '—'}
    </div>
  </div>
);

const StatsBar = ({ stats }) => {
  if (!stats) return null;
  const { totalRuns, totalRecords, avgDuration } = stats;

  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
      <Stat label="Total Runs"    value={totalRuns}                              color="var(--nsw)" />
      <Stat label="Total Records" value={totalRecords}                           color="var(--hou)" />
      <Stat label="Avg Duration"  value={avgDuration ? `${(avgDuration/1000).toFixed(1)}s` : '—'} color="var(--all)" />
    </div>
  );
};

export default StatsBar;
