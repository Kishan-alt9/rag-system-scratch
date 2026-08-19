import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Layers, FileText } from 'lucide-react';

export const ScopeSelector = ({ documents = [], selectedDocName, onSelectScope }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
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

  const handleSelect = (docName) => {
    onSelectScope(docName);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          fontSize: '11.5px',
          fontWeight: 500,
          borderRadius: 'var(--radius-sm)',
          backgroundColor: selectedDocName ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-surface)',
          border: selectedDocName ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid var(--border-medium)',
          color: selectedDocName ? 'var(--text-accent)' : 'var(--text-primary)',
          transition: 'all 0.12s ease'
        }}
        onMouseEnter={(e) => {
          if (!selectedDocName) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
        }}
        onMouseLeave={(e) => {
          if (!selectedDocName) e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
        }}
      >
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}>
          Scope:
        </span>
        <span style={{ fontWeight: 600 }}>
          {selectedDocName || 'All Documents'}
        </span>
        <ChevronDown style={{ width: '12px', height: '12px', opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '4px',
          minWidth: '220px',
          maxWidth: '300px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-elevated)',
          zIndex: 60,
          padding: '6px'
        }} className="animate-fade-in">
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '4px 8px',
            marginBottom: '4px',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            Search Scope
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '200px', overflowY: 'auto' }}>
            {/* Option: All Documents */}
            <div
              onClick={() => handleSelect(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '12.5px',
                color: 'var(--text-primary)',
                backgroundColor: !selectedDocName ? 'var(--bg-surface-active)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (selectedDocName) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                if (selectedDocName) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <Layers style={{ width: '13px', height: '13px', color: 'var(--text-tertiary)', flexShrink: 0 }} />
                <span style={{ fontWeight: !selectedDocName ? 600 : 400 }}>All Documents</span>
              </div>
              {!selectedDocName && <Check style={{ width: '13px', height: '13px', color: 'var(--text-accent)' }} />}
            </div>

            {/* Individual Documents */}
            {documents.map((doc) => {
              const isSelected = selectedDocName === doc.name;
              return (
                <div
                  key={doc.name}
                  onClick={() => handleSelect(doc.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    color: 'var(--text-primary)',
                    backgroundColor: isSelected ? 'var(--bg-surface-active)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <FileText style={{ width: '13px', height: '13px', color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    <span style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: isSelected ? 600 : 400
                    }}>
                      {doc.name}
                    </span>
                  </div>
                  {isSelected && <Check style={{ width: '13px', height: '13px', color: 'var(--text-accent)', flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>

          {selectedDocName && (
            <div style={{
              marginTop: '6px',
              paddingTop: '6px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '10px',
              color: 'var(--text-tertiary)',
              paddingLeft: '4px'
            }}>
              Scope saved in frontend (backend filter integration point ready)
            </div>
          )}
        </div>
      )}
    </div>
  );
};
