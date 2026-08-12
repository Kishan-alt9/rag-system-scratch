import React from 'react';
import { Sparkles, ArrowRight, FileText } from 'lucide-react';

const SAMPLE_PROMPTS = [
  "What is the subject of this report?",
  "Summarize the key findings.",
  "Who are the authors?",
  "What are the main recommendations?"
];

export const EmptyState = ({ onSelectPrompt }) => {
  return (
    <div style={{
      maxWidth: '680px',
      margin: 'auto',
      padding: '40px 20px',
      textAlign: 'center'
    }}>
      {/* Icon Badge */}
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px auto',
        color: 'var(--text-accent)'
      }}>
        <Sparkles style={{ width: '28px', height: '28px' }} />
      </div>

      {/* Main Title */}
      <h2 style={{
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '-0.02em',
        marginBottom: '10px'
      }}>
        Ask your documents.
      </h2>

      {/* Subtext */}
      <p style={{
        fontSize: '15px',
        color: 'var(--text-secondary)',
        maxWidth: '480px',
        margin: '0 auto 36px auto',
        lineHeight: '1.6'
      }}>
        Upload your PDFs and ask questions using verified information from your document library.
      </p>

      {/* Suggestion Prompts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '12px',
        textAlign: 'left'
      }}>
        {SAMPLE_PROMPTS.map((prompt, idx) => (
          <div
            key={idx}
            onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
            className="card card-interactive"
            style={{
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText style={{ width: '16px', height: '16px', color: 'var(--text-accent)', flexShrink: 0 }} />
              <span style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-primary)' }}>
                {prompt}
              </span>
            </div>
            <ArrowRight style={{ width: '14px', height: '14px', color: 'var(--text-tertiary)', flexShrink: 0 }} />
          </div>
        ))}
      </div>
    </div>
  );
};
