import React from 'react';

const styles = {
  header: {
    background:    'var(--sf)',
    borderBottom:  '1px solid var(--bd)',
    padding:       '0 28px',
    height:        '56px',
    display:       'flex',
    alignItems:    'center',
    gap:           '14px',
    position:      'sticky',
    top:           0,
    zIndex:        100,
  },
  logo: {
    width:         '36px',
    height:        '36px',
    border:        '2px solid var(--nsw)',
    borderRadius:  '8px',
    display:       'grid',
    placeItems:    'center',
    fontFamily:    'var(--sans)',
    fontWeight:    800,
    fontSize:      '14px',
    color:         'var(--nsw)',
    letterSpacing: '-1px',
    boxShadow:     '0 0 16px var(--nsw-glow)',
    animation:     'pulse 3s ease-in-out infinite',
    flexShrink:    0,
  },
  title: { fontFamily: 'var(--sans)', fontSize: '17px', fontWeight: 700, color: '#fff' },
  sub:   { fontSize: '10px', color: 'var(--muted)', letterSpacing: '.5px', textTransform: 'uppercase', marginTop: '2px' },
  right: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' },
  dot:   { width: '7px', height: '7px', borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 7px var(--ok)', animation: 'blink 2s ease-in-out infinite' },
  nav:   { display: 'flex', gap: '6px', marginLeft: '24px' },
};

const NavBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      background:   active ? 'var(--dim)' : 'none',
      border:       `1px solid ${active ? 'var(--bd2)' : 'transparent'}`,
      color:        active ? '#fff' : 'var(--muted)',
      borderRadius: '6px',
      padding:      '5px 14px',
      fontSize:     '11px',
      fontFamily:   'var(--mono)',
      transition:   'all .2s',
    }}
  >
    {children}
  </button>
);

const Header = ({ page, setPage }) => (
  <>
    <style>{`
      @keyframes pulse { 0%,100%{box-shadow:0 0 16px var(--nsw-glow)} 50%{box-shadow:0 0 28px var(--nsw-glow)} }
      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.25} }
    `}</style>
    <header style={styles.header}>
      <div style={styles.logo}>SK</div>
      <div>
        <div style={styles.title}>ScrapeKit</div>
        <div style={styles.sub}>MERN Planning Extractor</div>
      </div>
      <nav style={styles.nav}>
        <NavBtn active={page === 'dashboard'} onClick={() => setPage('dashboard')}>Dashboard</NavBtn>
        <NavBtn active={page === 'history'}   onClick={() => setPage('history')}>History</NavBtn>
      </nav>
      <div style={styles.right}>
        <div style={styles.dot} />
        <span style={{ fontSize: '10px', color: 'var(--muted)' }}>READY</span>
      </div>
    </header>
  </>
);

export default Header;
