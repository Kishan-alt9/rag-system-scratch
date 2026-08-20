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
  const { name, chunks, status = 'indexed' } = document;
  const isMutating = !!loadingAction;

  return (
    <div
      onClick={() => !isMutating && onSelect && onSelect(name)}
      className="interactive-item"
      style={{
        padding: '8px 10px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: isSelected ? 'var(--accent-bg-subtle)' : 'transparent',
        border: isSelected ? '1px solid rgba(99, 102, 241, 0.15)' : '1px solid transparent',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        userSelect: 'none',
        opacity: isMutating ? 0.6 : 1,
        cursor: isMutating ? 'not-allowed' : 'pointer'
      }}
    >
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : '#f8fafc',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: isSelected ? 'var(--accent-indigo)' : 'var(--text-secondary)'
      }}>
        {isMutating ? (
          <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />
        ) : (
          <FileText style={{ width: '14px', height: '14px' }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '12.5px',
          fontWeight: isSelected ? 700 : 500,
          color: isSelected ? 'var(--text-accent)' : 'var(--text-primary)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {name}
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '1.5px',
          fontSize: '10.5px',
          color: 'var(--text-tertiary)'
        }}>
          <span>{chunks || 0} chunks</span>
          <span style={{ opacity: 0.5 }}>•</span>

          {isMutating ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'var(--text-accent)',
              fontWeight: 600
            }}>
              {loadingAction === 'deleting' ? 'Deleting...' : 'Re-indexing...'}
            </span>
          ) : (
            status === 'indexed' && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                color: 'var(--text-success)',
                fontWeight: 600
              }}>
                <Check style={{ width: '10px', height: '10px', strokeWidth: 3 }} />
                Ready
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

export default DocumentItem;
