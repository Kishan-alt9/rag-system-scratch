import React, { useRef, useEffect } from 'react';
import { Message } from './Message';
import { AlertCircle, ChevronRight, Loader2 } from 'lucide-react';

export const ChatWindow = ({
  messages = [],
  isLoading = false,
  error = null,
  onCitationClick
}) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, error]);

  const pipelineSteps = ['Query', 'Retrieve', 'Rerank', 'Generate'];

  return (
    <div style={{
      maxWidth: '760px',
      margin: '0 auto',
      width: '100%',
      padding: '24px 20px 40px 20px'
    }}>
      {messages.map((msg, index) => (
        <Message
          key={index}
          msgIndex={index}
          question={msg.question}
          answer={msg.answer}
          sources={msg.sources}
          noSourcesFound={msg.noSourcesFound}
          onCitationClick={onCitationClick}
        />
      ))}

      {isLoading && (
        <div style={{
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }} className="animate-fade-in">
          {/* Subtle Pipeline Sequence */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--border-subtle)',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            <Loader2 className="animate-spin" style={{ width: '13px', height: '13px', color: 'var(--accent-indigo)' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {pipelineSteps.map((step, idx) => (
                <React.Fragment key={step}>
                  <span style={{
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    opacity: 0.8
                  }}>
                    {step}
                  </span>
                  {idx < pipelineSteps.length - 1 && (
                    <ChevronRight style={{ width: '12px', height: '12px', color: 'var(--text-tertiary)' }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Synthesizing answer from grounded search...</span>
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(244, 63, 94, 0.05)',
          border: '1px solid rgba(244, 63, 94, 0.1)',
          color: 'var(--text-error)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px'
        }}>
          <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
