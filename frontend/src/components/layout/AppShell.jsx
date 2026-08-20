import React from 'react';

export const AppShell = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-app-gradient)',
      color: 'var(--text-primary)',
      padding: '24px',
      gap: '24px'
    }}>
      {children}
    </div>
  );
};

export default AppShell;
