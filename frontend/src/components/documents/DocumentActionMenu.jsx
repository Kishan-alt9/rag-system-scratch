import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Info, RefreshCw, Trash2 } from 'lucide-react';

export const DocumentActionMenu = ({ document, onViewDetails, onReindex, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Document actions"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px 4px',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-tertiary)',
          backgroundColor: isOpen ? 'var(--bg-surface-active)' : 'transparent',
          transition: 'color 0.12s ease, background-color 0.12s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.color = 'var(--text-tertiary)';
        }}
      >
        <MoreHorizontal style={{ width: '15px', height: '15px' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          marginTop: '4px',
          width: '180px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-elevated)',
          zIndex: 60,
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          {/* Action 1: View Details */}
          <button
            onClick={() => {
              setIsOpen(false);
              if (onViewDetails) onViewDetails(document);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              fontSize: '12px',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info style={{ width: '13px', height: '13px', color: 'var(--text-accent)' }} />
              <span>View details</span>
            </div>
          </button>

          {/* Action 2: Re-index */}
          <button
            onClick={() => {
              setIsOpen(false);
              if (onReindex) onReindex(document);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              fontSize: '12px',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw style={{ width: '13px', height: '13px', color: 'var(--text-accent)' }} />
              <span>Re-index</span>
            </div>
          </button>

          {/* Action 3: Delete */}
          <button
            onClick={() => {
              setIsOpen(false);
              if (onDelete) onDelete(document);
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 8px',
              fontSize: '12px',
              color: 'var(--text-error)',
              borderRadius: 'var(--radius-sm)',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trash2 style={{ width: '13px', height: '13px', color: 'var(--text-error)' }} />
              <span>Delete</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
