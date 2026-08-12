import React from 'react';
import { User, Bot } from 'lucide-react';
import { AnswerCard } from './AnswerCard';
import { SourceList } from '../sources/SourceList';

export const Message = ({ question, answer, sources, isLast }) => {
  return (
    <div style={{ marginBottom: '32px' }} className="animate-fade-in">
      {/* User Question */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-card-hover)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          flexShrink: 0
        }}>
          <User style={{ width: '16px', height: '16px' }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '4px' }}>
            YOU
          </div>
          <div style={{
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'inline-block',
            maxWidth: '100%'
          }}>
            {question}
          </div>
        </div>
      </div>

      {/* Assistant Response */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-accent)',
          flexShrink: 0
        }}>
          <Bot style={{ width: '18px', height: '18px' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '4px' }}>
            RAG ASSISTANT
          </div>

          <AnswerCard answer={answer} />

          <SourceList sources={sources} />
        </div>
      </div>
    </div>
  );
};
