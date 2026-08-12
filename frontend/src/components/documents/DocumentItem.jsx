import React from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';

export const DocumentItem = ({ document, isSelected, onSelect }) => {
  const { name, pages, chunks, status = 'indexed' } = document;

  return (
    <div
      onClick={() => onSelect && onSelect(name)}
      className={`card card-interactive`}
      style={{
        padding: '12px 14px',
        marginBottom: '8px',
        backgroundColor: isSelected ? 'var(--bg-accent-subtle)' : 'var(--bg-card)',
        borderColor: isSelected ? 'var(--border-focus)' : 'var(--border-subtle)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        userSelect: 'none'
      }}
    >
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: '#f87171'
      }}>
        <FileText style={{ width: '18px', height: '18px' }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {name}
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '4px',
          fontSize: '11px',
          color: 'var(--text-tertiary)'
        }}>
          {pages ? (
            <span>{pages} {pages === 1 ? 'page' : 'pages'}</span>
          ) : chunks ? (
            <span>{chunks} {chunks === 1 ? 'chunk' : 'chunks'}</span>
          ) : null}

          {status === 'indexed' && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              color: 'var(--text-success)',
              fontWeight: 500
            }}>
              <CheckCircle2 style={{ width: '12px', height: '12px' }} />
              Indexed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
