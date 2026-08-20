import React, { useRef, useEffect } from 'react';
import { Message } from './Message';
import { AlertCircle, Search, Database, Layers, Cpu } from 'lucide-react';

export const ChatWindow = ({
  messages = [],
  isLoading = false,
  error = null,
  activeMessageIndex = null,
  selectedCitationIndex = null,
  onSelectSource
}) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, error]);

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
          isLast={index === messages.length - 1}
          selectedCitationIndex={activeMessageIndex === index ? selectedCitationIndex : null}
          onSelectSource={onSelectSource}
        />
      ))}

      {isLoading && (
        <div style={{
          padding: '20px 24px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }} className="animate-fade-in">
          {/* Subtle Pipeline Sequence */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', maxWidth: '440px', position: 'relative' }}>
            {/* Step 1: Query */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-accent)'
              }}>
                <Search style={{ width: '14px', height: '14px' }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>Query</span>
            </div>

            {/* Line 1 */}
            <svg style={{ flex: 1, height: '2px', minWidth: '32px', marginTop: '-18px' }}>
              <line x1="0" y1="1" x2="100%" y2="1" stroke="var(--border-medium)" strokeWidth="2" />
              <line x1="0" y1="1" x2="100%" y2="1" stroke="var(--accent-primary)" strokeWidth="2" className="animate-flow-dash" />
            </svg>

            {/* Step 2: Retrieval */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(56, 189, 248, 0.06)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)'
              }}>
                <Database style={{ width: '14px', height: '14px' }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Retrieval</span>
            </div>

            {/* Line 2 */}
            <svg style={{ flex: 1, height: '2px', minWidth: '32px', marginTop: '-18px' }}>
              <line x1="0" y1="1" x2="100%" y2="1" stroke="var(--border-medium)" strokeWidth="2" />
              <line x1="0" y1="1" x2="100%" y2="1" stroke="var(--accent-primary)" strokeWidth="2" className="animate-flow-dash" />
            </svg>

            {/* Step 3: Evidence */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(56, 189, 248, 0.06)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)'
              }}>
                <Layers style={{ width: '14px', height: '14px' }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Evidence</span>
            </div>

            {/* Line 3 */}
            <svg style={{ flex: 1, height: '2px', minWidth: '32px', marginTop: '-18px' }}>
              <line x1="0" y1="1" x2="100%" y2="1" stroke="var(--border-medium)" strokeWidth="2" />
              <line x1="0" y1="1" x2="100%" y2="1" stroke="var(--accent-primary)" strokeWidth="2" className="animate-flow-dash" />
            </svg>

            {/* Step 4: Answer */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', zIndex: 2 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(56, 189, 248, 0.06)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)'
              }}>
                <Cpu style={{ width: '14px', height: '14px' }} />
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Answer</span>
            </div>
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 400 }}>
            Querying vector index & synthesizing response...
          </div>
        </div>
      )}

      {error && (
        <div style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: 'var(--text-error)',
          fontSize: '13.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '24px'
        }}>
          <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
