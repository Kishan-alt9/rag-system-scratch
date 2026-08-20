import React from 'react';
import { DocStack3D } from './DocStack3D';
import { AlertCircle, FileText, HelpCircle, GitCompare } from 'lucide-react';

const QUICK_ACTIONS = [
  {
    label: "Summarize a document",
    text: "Can you provide a comprehensive summary of my uploaded document, detailing its key sections and architectural overview?",
    icon: FileText
  },
  {
    label: "Explain a concept",
    text: "Explain the core concepts and underlying mechanisms discussed in the indexed papers.",
    icon: HelpCircle
  },
  {
    label: "Compare topics",
    text: "Compare and contrast the primary technologies and trade-offs presented across my documents.",
    icon: GitCompare
  }
];

export const EmptyState = ({ onSelectPrompt, apiOffline }) => {
  return (
    <div style={{
      maxWidth: '640px',
      margin: 'auto',
      padding: '40px 20px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px'
    }} className="animate-fade-in">
      
      {/* Offline Warning */}
      {apiOffline && (
        <div style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: '#fff1f2',
          border: '1px solid #ffe4e6',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '12.5px',
          fontWeight: 500
        }}>
          <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          <span>FastAPI server offline. Please make sure the backend is running.</span>
        </div>
      )}

      {/* 3D Masterpiece illustration */}
      <DocStack3D />

      {/* Editorial Empty State Typography */}
      <div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          marginBottom: '8px'
        }}>
          Research your documents
        </h2>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          fontWeight: 400,
          maxWidth: '400px',
          margin: '0 auto',
          lineHeight: '1.5'
        }}>
          Ask questions across your knowledge base.
        </p>
      </div>

      {/* Quick Action Pill Buttons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '12px'
      }}>
        {QUICK_ACTIONS.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt && onSelectPrompt(action.text)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-indigo)';
                e.currentTarget.style.color = 'var(--text-accent)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <Icon style={{ width: '14px', height: '14px' }} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EmptyState;
