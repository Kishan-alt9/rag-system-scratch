import React from 'react';

export const AppShell = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-app)',
      color: 'var(--text-primary)'
    }}>
      {children}
    </div>
  );
};
