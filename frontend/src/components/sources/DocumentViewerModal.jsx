import React, { useEffect } from 'react';
import { X, FileText, AlertCircle } from 'lucide-react';

export const DocumentViewerModal = ({ isOpen, onClose, source }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !source) return null;

  const { document: docName, page, snippet, text, content, score } = source;
  const passage = snippet || text || content;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }} onClick={onClose} className="animate-fade-in">
      <div style={{
        width: '100%',
        maxWidth: '620px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-elevated)',
        overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-app)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <FileText style={{ width: '16px', height: '16px', color: 'var(--text-accent)', flexShrink: 0 }} />
            <span style={{
              fontSize: '13.5px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {docName}
            </span>
            {page !== undefined && page !== null && (
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-tertiary)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                flexShrink: 0
              }}>
                Page {page}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            style={{ color: 'var(--text-tertiary)', padding: '4px', borderRadius: 'var(--radius-sm)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '20px' }}>
          {/* Passage Quote if present */}
          {passage && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: 'var(--text-tertiary)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '6px'
              }}>
                Cited Passage Snippet
              </div>
              <div style={{
                padding: '12px 14px',
                backgroundColor: 'var(--bg-app)',
                borderLeft: '3px solid var(--border-focus)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                color: 'var(--text-primary)',
                lineHeight: '1.6',
                fontStyle: 'italic'
              }}>
                "{passage}"
              </div>
            </div>
          )}

          {/* Technical PDF Viewer Placeholder Notice */}
          <div style={{
            padding: '14px 16px',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <AlertCircle style={{ width: '18px', height: '18px', color: 'var(--text-tertiary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>
                PDF Viewer Integration Point
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
                Full binary PDF page view streaming connects via backend endpoint <code style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-accent)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  padding: '1px 4px',
                  borderRadius: '3px'
                }}>GET /documents/id/page/{page}</code>.
              </div>
              {score !== undefined && score !== null && (
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-success)', marginTop: '8px' }}>
                  Retrieved Chunk Relevance Score: {(score * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 18px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          backgroundColor: 'var(--bg-app)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
