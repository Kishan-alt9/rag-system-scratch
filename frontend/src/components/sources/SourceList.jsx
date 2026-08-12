import React from 'react';
import { SourceCard } from './SourceCard';
import { Bookmark } from 'lucide-react';

export const SourceList = ({ sources = [] }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--text-tertiary)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        marginBottom: '10px'
      }}>
        <Bookmark style={{ width: '13px', height: '13px', color: 'var(--text-accent)' }} />
        <span>Sources ({sources.length})</span>
      </div>

      <div>
        {sources.map((src, idx) => (
          <SourceCard key={idx} source={src} />
        ))}
      </div>
    </div>
  );
};
