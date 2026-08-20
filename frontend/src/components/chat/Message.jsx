import React from 'react';
import { User, Bot } from 'lucide-react';
import { AnswerCard } from './AnswerCard';
import { SourceList } from '../sources/SourceList';

export const Message = ({
  question,
  answer,
  sources,
  isLast,
  msgIndex,
  selectedCitationIndex = null,
  onSelectSource
}) => {
  return (
    <div style={{ marginBottom: '28px' }} className="animate-fade-in">
      {/* User Question */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          flexShrink: 0
        }}>
          <User style={{ width: '15px', height: '15px' }} />
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '10.5px',
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            marginBottom: '4px',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em'
          }}>
            YOU
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            backgroundColor: 'rgba(255, 255, 255, 0.025)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'inline-block',
            maxWidth: '100%',
            lineHeight: '1.5'
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
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid var(--border-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-accent)',
          flexShrink: 0
        }}>
          <Bot style={{ width: '16px', height: '16px' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '10.5px',
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            marginBottom: '4px',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em'
          }}>
            RAG ASSISTANT
          </div>

          <AnswerCard answer={answer} />

          <SourceList
            sources={sources}
            selectedCitationIndex={selectedCitationIndex}
            onSelectSource={(citationIndex) => onSelectSource && onSelectSource(msgIndex, citationIndex)}
          />
        </div>
      </div>
    </div>
  );
};
