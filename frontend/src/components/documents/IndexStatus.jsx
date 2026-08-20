import React from 'react';
import { Database, Check } from 'lucide-react';

export const IndexStatus = ({ totalChunks = 0, documentCount = 0, isReady = true }) => {
  return (
    <div style={{
      margin: '16px',
      padding: '14px',
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <span style={{
          fontSize: '10.5px',
          fontWeight: 700,
          color: 'var(--text-tertiary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-mono)'
        }}>
          INDEX STATUS
        </span>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 6px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          fontWeight: 500,
          backgroundColor: isReady ? 'rgba(52, 211, 153, 0.08)' : 'rgba(248, 113, 113, 0.08)',
          color: isReady ? 'var(--text-success)' : 'var(--text-error)',
          border: `1px solid ${isReady ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`
        }}>
          <Check style={{ width: '11px', height: '11px' }} />
          Active
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px'
      }}>
        <div style={{
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {totalChunks}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
            chunks
          </div>
        </div>

        <div style={{
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {documentCount}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
            {documentCount === 1 ? 'document' : 'documents'}
          </div>
        </div>
      </div>
    </div>
  );
};
