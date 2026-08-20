import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

export const SourceCard = ({ source, index, isSelected, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { document, page, snippet } = source;

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(index);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`card ${isSelected ? 'perspective-card' : 'card-interactive'}`}
      style={{
        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.06)' : 'var(--bg-source)',
        borderColor: isSelected ? 'var(--border-focus)' : 'var(--border-source)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        marginBottom: '8px',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isSelected ? 'translateY(-1px)' : 'none',
        boxShadow: isSelected ? '0 4px 16px -2px rgba(56, 189, 248, 0.2)' : 'none'
      }}
    >
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span 
            className={`citation-badge ${isSelected ? 'active' : ''}`}
            style={{ flexShrink: 0 }}
          >
            {index + 1}
          </span>

          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-accent)'
          }}>
            <FileText style={{ width: '13px', height: '13px' }} />
          </div>

          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginRight: '8px' }}>
              {document}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--text-accent)',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)'
            }}>
              Page {page}
            </span>
          </div>
        </div>

        {snippet && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', padding: '4px' }}
          >
            {isExpanded ? <ChevronUp style={{ width: '15px', height: '15px' }} /> : <ChevronDown style={{ width: '15px', height: '15px' }} />}
          </button>
        )}
      </div>

      {snippet && isExpanded && (
        <div style={{
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(56, 189, 248, 0.15)',
          fontSize: '12px',
          fontFamily: 'var(--font-sans)',
          color: 'var(--text-secondary)',
          lineHeight: '1.55'
        }}>
          "{snippet}"
        </div>
      )}
    </div>
  );
};
