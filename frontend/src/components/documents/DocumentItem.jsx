import React from 'react';
import { FileText, Check, Loader2 } from 'lucide-react';
import { DocumentActionMenu } from './DocumentActionMenu';

export const DocumentItem = ({
  document,
  isSelected,
  onSelect,
  onViewDetails,
  onReindex,
  onDelete,
  loadingAction
}) => {
  const { name, pages, chunks, status = 'indexed' } = document;
  const isMutating = !!loadingAction;

  return (
    <div
      onClick={() => !isMutating && onSelect && onSelect(name)}
      className={`card perspective-card ${isMutating ? '' : 'card-interactive'}`}
      style={{
        padding: '11px 13px',
        marginBottom: '8px',
        backgroundColor: isSelected ? 'var(--bg-accent-subtle)' : 'var(--bg-card)',
        borderColor: isSelected ? 'var(--border-focus)' : 'var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        userSelect: 'none',
        opacity: isMutating ? 0.6 : 1,
        cursor: isMutating ? 'not-allowed' : 'pointer'
      }}
    >
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(56, 189, 248, 0.08)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: 'var(--text-accent)'
      }}>
        {isMutating ? (
          <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} />
        ) : (
          <FileText style={{ width: '16px', height: '16px' }} />
        )}
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
          marginTop: '3px',
          fontSize: '11px',
          color: 'var(--text-tertiary)'
        }}>
          {pages ? (
            <span>{pages} {pages === 1 ? 'page' : 'pages'}</span>
          ) : chunks ? (
            <span>{chunks} {chunks === 1 ? 'chunk' : 'chunks'}</span>
          ) : null}

          {isMutating ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'var(--text-accent)',
              fontWeight: 500
            }}>
              {loadingAction === 'deleting' ? 'Deleting...' : 'Re-indexing...'}
            </span>
          ) : (
            status === 'indexed' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                color: 'var(--text-success)',
                fontWeight: 500
              }}>
                <Check style={{ width: '11px', height: '11px' }} />
                Indexed
              </span>
            )
          )}
        </div>
      </div>

      {!isMutating && (
        <DocumentActionMenu
          document={document}
          onViewDetails={onViewDetails}
          onReindex={onReindex}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};
