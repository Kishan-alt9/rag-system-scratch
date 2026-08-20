import React, { useEffect, useRef } from 'react';
import { FileText, X, Hash } from 'lucide-react';

export const CitationPopover = ({ source, rect, onClose }) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!source) return null;

  const { document: docName, page, snippet, chunk_id } = source;

  // Calculate coordinates.
  const popoverWidth = 320;
  // Position right under the badge, but limit within screen limits
  let left = rect.left + rect.width / 2 - popoverWidth / 2;
  left = Math.max(16, Math.min(left, window.innerWidth - popoverWidth - 16));

  const spaceBelow = window.innerHeight - rect.bottom;
  const showAbove = spaceBelow < 180; // If less than 180px below, show above
  const top = showAbove 
    ? rect.top - 8 
    : rect.bottom + 8;

  const transform = showAbove ? 'translateY(-100%)' : 'none';

  return (
    <div
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${popoverWidth}px`,
        transform,
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-popover)',
        padding: '16px',
        zIndex: 999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}
      className="animate-scale-in"
    >
      {/* Popover Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-indigo)',
            flexShrink: 0
          }}>
            <FileText style={{ width: '13px', height: '13px' }} />
          </div>
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {docName}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '2px',
            color: 'var(--text-tertiary)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          <X style={{ width: '14px', height: '14px' }} />
        </button>
      </div>

      {/* Popover Middle Meta info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
        <span style={{
          backgroundColor: 'var(--accent-bg-subtle)',
          color: 'var(--accent-indigo)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontWeight: 600
        }}>
          Page {page}
        </span>
        
        {chunk_id && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            padding: '1.5px 5px',
            borderRadius: '4px'
          }}>
            <Hash style={{ width: '10px', height: '10px' }} />
            {String(chunk_id).substring(0, 8)}...
          </span>
        )}
      </div>

      {/* Popover Content Snippet */}
      {snippet && (
        <div style={{
          fontSize: '12px',
          lineHeight: '1.5',
          color: 'var(--text-secondary)',
          backgroundColor: '#f8fafc',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          borderLeft: '2.5px solid var(--accent-indigo)',
          maxHeight: '120px',
          overflowY: 'auto',
          wordBreak: 'break-word',
          fontStyle: 'italic'
        }}>
          "{snippet}"
        </div>
      )}
    </div>
  );
};

export default CitationPopover;
