import React from 'react';
import { Layers } from 'lucide-react';

export const Branding = ({ isConnected = true }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '56px',
      padding: '0 20px',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--bg-app)',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid var(--border-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-accent)'
        }}>
          <Layers style={{ width: '16px', height: '16px' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
            RAG Workspace
          </h1>
          <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', fontWeight: 500, letterSpacing: '0.02em' }}>
            Research Intelligence
          </span>
        </div>
      </div>

      <div 
        title={isConnected ? 'Backend API Online' : 'Backend API Offline'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          fontSize: '11px',
          fontWeight: 500,
          color: isConnected ? 'var(--text-success)' : 'var(--text-error)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: isConnected ? 'rgba(52, 211, 153, 0.08)' : 'rgba(248, 113, 113, 0.08)',
          border: `1px solid ${isConnected ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`
        }}
      >
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: isConnected ? 'var(--text-success)' : 'var(--text-error)',
          display: 'inline-block'
        }} />
        <span>{isConnected ? 'Ready' : 'Offline'}</span>
      </div>
    </div>
  );
};
