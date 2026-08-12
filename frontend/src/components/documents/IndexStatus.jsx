import React from 'react';
import { Database, CheckCircle2, Layers } from 'lucide-react';

export const IndexStatus = ({ totalChunks = 63, documentCount = 1, isReady = true }) => {
  return (
    <div style={{
      margin: '16px',
      padding: '14px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          INDEX STATUS
        </span>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 7px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          fontWeight: 500,
          background: 'rgba(16, 185, 129, 0.1)',
          color: 'var(--text-success)',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <CheckCircle2 style={{ width: '12px', height: '12px' }} />
          Ready
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginTop: '6px'
      }}>
        <div style={{
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {totalChunks}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '1px' }}>
            indexed chunks
          </div>
        </div>

        <div style={{
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
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
