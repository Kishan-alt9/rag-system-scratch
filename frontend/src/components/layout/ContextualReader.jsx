import React from 'react';
import { FileSearch, FileText, BookmarkCheck, Sparkles } from 'lucide-react';

export const ContextualReader = ({
  activeSources = [],
  selectedCitationIndex = null,
  onSelectCitation
}) => {
  const hasSources = activeSources && activeSources.length > 0;

  return (
    <aside style={{
      width: '330px',
      height: '100%',
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-floating)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        height: '56px',
        padding: '0 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--bg-app)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSearch style={{ width: '16px', height: '16px', color: 'var(--text-accent)' }} />
          <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Evidence Inspector
          </span>
        </div>

        {hasSources && (
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-accent-subtle)',
            color: 'var(--text-accent)',
            border: '1px solid var(--border-accent)'
          }}>
            {activeSources.length} {activeSources.length === 1 ? 'source' : 'sources'}
          </span>
        )}
      </div>

      {/* Body Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {!hasSources ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '70%',
            textAlign: 'center',
            color: 'var(--text-tertiary)'
          }}>
            <BookmarkCheck style={{ width: '32px', height: '32px', marginBottom: '12px', opacity: 0.25, color: 'var(--text-accent)' }} />
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              No Evidence Selected
            </h4>
            <p style={{ fontSize: '11.5px', lineHeight: '1.5', maxWidth: '240px', color: 'var(--text-tertiary)' }}>
              Ask a question or click any citation badge in the chat to inspect verified evidence chunks.
            </p>
          </div>
        ) : (
          <>
            <div style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: 'var(--text-tertiary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)'
            }}>
              EVIDENCE
            </div>

            {activeSources.map((source, index) => {
              const { document: docName, page, snippet } = source;
              const isSelected = selectedCitationIndex === index;
              const chunkLabel = page !== undefined ? `Chunk ${page}:${index}` : `Chunk ${index}`;

              return (
                <div
                  key={index}
                  onClick={() => onSelectCitation && onSelectCitation(index)}
                  className={`card evidence-card ${isSelected ? 'active' : 'card-interactive'}`}
                  style={{
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {/* Top Metadata Row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <FileText style={{ width: '13px', height: '13px', color: 'var(--text-accent)', flexShrink: 0 }} />
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {docName || 'Document'}
                        </span>
                      </div>

                      {page !== undefined && (
                        <span style={{
                          fontSize: '11px',
                          color: 'var(--text-secondary)',
                          fontWeight: 500
                        }}>
                          Page {page}
                        </span>
                      )}
                    </div>

                    <span className={`citation-badge ${isSelected ? 'active' : ''}`} style={{ flexShrink: 0 }}>
                      {index + 1}
                    </span>
                  </div>

                  {/* Snippet Quote Block */}
                  {snippet ? (
                    <div style={{
                      fontSize: '12.5px',
                      fontFamily: 'var(--font-sans)',
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      lineHeight: '1.6',
                      backgroundColor: 'rgba(0, 0, 0, 0.25)',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: '2px solid rgba(56, 189, 248, 0.4)',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      "{snippet}"
                    </div>
                  ) : (
                    <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                      Indexed chunk reference from {docName} (Page {page || 1}).
                    </div>
                  )}

                  {/* Clean Divider */}
                  <div style={{
                    height: '1px',
                    backgroundColor: 'var(--border-subtle)',
                    margin: '2px 0'
                  }} />

                  {/* Match Rationale & Chunk Label */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                    fontSize: '11px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-tertiary)' }}>
                      <Sparkles style={{ width: '11px', height: '11px', color: 'var(--text-accent)' }} />
                      <span>Retrieved because this passage matches your question.</span>
                    </div>

                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-tertiary)',
                      fontSize: '10px',
                      flexShrink: 0
                    }}>
                      {chunkLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </aside>
  );
};
