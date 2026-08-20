import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { AnswerEditorial } from './AnswerEditorial';

export const Message = ({
  question,
  answer,
  sources,
  noSourcesFound,
  msgIndex,
  onCitationClick
}) => {
  return (
    <div style={{ marginBottom: '32px' }} className="animate-fade-in">
      {/* User Question */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-subtle)',
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
            fontSize: '10px',
            fontWeight: 800,
            color: 'var(--text-tertiary)',
            marginBottom: '4px',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em'
          }}>
            QUESTION
          </div>
          <div style={{
            fontSize: '14.5px',
            fontWeight: 600,
            color: 'var(--text-primary)',
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
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--accent-glow-gradient)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-indigo)',
          flexShrink: 0
        }}>
          <Sparkles style={{ width: '14px', height: '14px' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 800,
            color: 'var(--text-tertiary)',
            marginBottom: '4px',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em'
          }}>
            ANSWER
          </div>

          <AnswerEditorial
            answer={answer}
            sources={sources}
            noSourcesFound={noSourcesFound}
            onCitationClick={onCitationClick}
            msgIndex={msgIndex}
          />
        </div>
      </div>
    </div>
  );
};

export default Message;
