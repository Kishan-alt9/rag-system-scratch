import React from 'react';
import { Layers, Circle } from 'lucide-react';

export const Branding = ({ isConnected = true }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-sm)',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'content',
          color: 'var(--text-accent)'
        }}>
          <Layers style={{ width: '18px', height: '18px', margin: 'auto' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            RAG Workspace
          </h1>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Doc Intelligence
          </span>
        </div>
      </div>

      <div 
        title={isConnected ? 'Backend API Connected' : 'Backend API Offline'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: 500,
          color: isConnected ? 'var(--text-success)' : 'var(--text-error)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          background: isConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
        }}
      >
        <Circle style={{
          width: '7px',
          height: '7px',
          fill: 'currentColor',
          stroke: 'none'
        }} />
        <span>{isConnected ? 'Connected' : 'Offline'}</span>
      </div>
    </div>
  );
};
