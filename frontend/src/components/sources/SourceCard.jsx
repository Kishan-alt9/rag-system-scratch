import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export const SourceCard = ({ source }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { document, page, snippet } = source;

  return (
    <div style={{
      backgroundColor: 'var(--bg-source)',
      border: '1px solid var(--border-source)',
      borderRadius: 'var(--radius-md)',
      padding: '10px 14px',
      marginBottom: '8px',
      transition: 'border-color 0.2s ease'
    }}>
      <div 
        onClick={() => snippet && setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: snippet ? 'pointer' : 'default',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-accent)'
          }}>
            <FileText style={{ width: '14px', height: '14px' }} />
          </div>

          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginRight: '8px' }}>
              {document}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--text-accent)',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)'
            }}>
              Page {page}
            </span>
          </div>
        </div>

        {snippet && (
          <div style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>
            {isExpanded ? <ChevronUp style={{ width: '16px', height: '16px' }} /> : <ChevronDown style={{ width: '16px', height: '16px' }} />}
          </div>
        )}
      </div>

      {snippet && isExpanded && (
        <div style={{
          marginTop: '10px',
          paddingTop: '8px',
          borderTop: '1px solid rgba(59, 130, 246, 0.15)',
          fontSize: '12.5px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
          lineHeight: '1.5'
        }}>
          "{snippet}"
        </div>
      )}
    </div>
  );
};
