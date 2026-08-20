import React from 'react';
import { DocStack3D } from './DocStack3D';
import { ArrowRight, FileText, AlertCircle, Sparkles, BookOpen, Layers, Compass } from 'lucide-react';

const SAMPLE_PROMPTS = [
  {
    icon: Sparkles,
    title: "Summarize Core Concepts",
    desc: "Extract key definitions and architectural highlights"
  },
  {
    icon: BookOpen,
    title: "Query Technical Details",
    desc: "Ask specific questions across indexed documents"
  },
  {
    icon: Layers,
    title: "Inspect Retrieved Evidence",
    desc: "Verify passages and page numbers for answers"
  },
  {
    icon: Compass,
    title: "Explore Knowledge Base",
    desc: "Discover concepts mapped across all indexed chunks"
  }
];

export const EmptyState = ({ onSelectPrompt, apiOffline }) => {
  return (
    <div style={{
      maxWidth: '720px',
      margin: 'auto',
      padding: '30px 20px',
      textAlign: 'center'
    }} className="animate-fade-in">
      {/* If API is offline */}
      {apiOffline && (
        <div style={{
          padding: '14px 18px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-error)',
          textAlign: 'center',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
          <div style={{ fontWeight: 600, fontSize: '13px' }}>
            FastAPI Server Offline — Make sure backend is running at http://127.0.0.1:8000
          </div>
        </div>
      )}

      {/* 3D Visual Document Stack */}
      <DocStack3D />

      {/* Oversized Modern Typography */}
      <h2 style={{
        fontSize: '32px',
        fontWeight: 800,
        color: 'var(--text-primary)',
        letterSpacing: '-0.03em',
        lineHeight: 1.2,
        marginBottom: '12px'
      }}>
        Research with <span style={{
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>Grounded Intelligence</span>
      </h2>

      {/* Subtext */}
      <p style={{
        fontSize: '15px',
        color: 'var(--text-secondary)',
        maxWidth: '520px',
        margin: '0 auto 36px auto',
        lineHeight: '1.6',
        fontWeight: 400
      }}>
        Query your indexed documents to extract verified answers, inspect source evidence, and trace exact page citations.
      </p>

      {/* Suggestion Prompts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '14px',
        textAlign: 'left'
      }}>
        {SAMPLE_PROMPTS.map((prompt, idx) => {
          const IconComp = prompt.icon;
          return (
            <div
              key={idx}
              onClick={() => onSelectPrompt && onSelectPrompt(prompt.title)}
              className="card card-interactive card-3d"
              style={{
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: idx % 2 === 0 ? 'var(--bg-accent-subtle)' : 'var(--bg-purple-subtle)',
                  color: idx % 2 === 0 ? 'var(--text-accent)' : 'var(--text-purple)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <IconComp style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {prompt.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    {prompt.desc}
                  </div>
                </div>
              </div>
              <ArrowRight style={{ width: '16px', height: '16px', color: 'var(--text-tertiary)', flexShrink: 0 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
