import React from 'react';

export const AppShell = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-app-gradient)',
      color: 'var(--text-primary)',
      padding: '14px 18px 18px 18px',
      gap: '14px'
    }}>
      {children}
    </div>
  );
};
