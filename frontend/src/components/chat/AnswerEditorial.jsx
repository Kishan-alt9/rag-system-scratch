import React, { useState } from 'react';
import { FileText, Copy, Check } from 'lucide-react';

export const AnswerEditorial = ({ answer = '', sources = [], noSourcesFound = false, onCitationClick, msgIndex }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isNoAnswer = noSourcesFound || 
                     answer.toLowerCase().includes("couldn't find the answer") ||
                     answer.toLowerCase().includes("could not find the answer") ||
                     answer === "I couldn't find the answer in the provided document.";

  if (isNoAnswer) {
    return (
      <div style={{
        fontSize: '14.5px',
        lineHeight: '1.7',
        color: 'var(--text-primary)',
        marginTop: '8px'
      }} className="animate-fade-in">
        <p style={{ fontWeight: 400, color: 'var(--text-primary)' }}>
          I couldn't find the answer in the provided document.
        </p>
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(244, 63, 94, 0.05)',
          border: '1px solid rgba(244, 63, 94, 0.1)',
          color: 'var(--text-error)',
          fontSize: '13px',
          fontWeight: 500,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          No supporting sources were found.
        </div>
      </div>
    );
  }

  // Parse text to extract citation markers like [S1], [S2] or [1], [2]
  // Pattern matches "[S1]" or "[1]"
  const parts = answer.split(/(\[S?\d+\])/gi);

  return (
    <div style={{
      fontSize: '14.5px',
      lineHeight: '1.7',
      color: 'var(--text-primary)',
      marginTop: '8px',
      position: 'relative'
    }} className="animate-fade-in">
      
      {/* Answer Paragraph Text with Inline Citations */}
      <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
        {parts.map((part, index) => {
          const citationMatch = part.match(/\[S?(\d+)\]/i);
          if (citationMatch) {
            const digit = citationMatch[1]; // e.g. "1" or "2"
            
            // Search sources array using citation_id / digit as source of truth
            const matchedSource = sources.find(src => 
              String(src.citation_id).toUpperCase() === `S${digit}`.toUpperCase() ||
              String(src.citation_id).toUpperCase() === digit.toUpperCase() ||
              String(src.citation_id).toUpperCase() === part.replace(/[\[\]]/g, '').toUpperCase()
            );

            if (matchedSource) {
              // Find the index of the source in the array to display correct citation number (1-based)
              const displayIndex = sources.indexOf(matchedSource) + 1;

              return (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    // Pass the turn index, matched citation_id, and coordinates
                    if (onCitationClick) {
                      onCitationClick(msgIndex, matchedSource.citation_id, rect);
                    }
                  }}
                  className="citation-badge"
                  style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: 'var(--accent-indigo)',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    padding: '0 5px',
                    height: '18px',
                    minWidth: '18px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 2px',
                    transition: 'all 0.2s'
                  }}
                >
                  {displayIndex}
                </button>
              );
            }
          }

          // Return normal text
          return <span key={index}>{part}</span>;
        })}
      </div>

      {/* Action / Copy Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '12px' }}>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            color: copied ? 'var(--text-success)' : 'var(--text-tertiary)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          {copied ? (
            <Check style={{ width: '12px', height: '12px', color: 'var(--text-success)' }} />
          ) : (
            <Copy style={{ width: '12px', height: '12px' }} />
          )}
          <span>{copied ? 'Copied response' : 'Copy response'}</span>
        </button>
      </div>

      {/* Editorial Citations List at the Bottom */}
      {sources.length > 0 && (
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Sources
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sources.map((src, idx) => {
              const displayIndex = idx + 1;
              const cleanDocName = src.document.replace('.pdf', '');
              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    if (onCitationClick) {
                      onCitationClick(msgIndex, src.citation_id, rect);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    padding: '4px 0',
                    width: 'fit-content'
                  }}
                  className="interactive-item"
                >
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent-indigo)',
                    width: '18px',
                    height: '18px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {displayIndex}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cleanDocName}</span>
                  <span style={{ color: 'var(--text-tertiary)' }}>·</span>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 500 }}>p. {src.page}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerEditorial;
