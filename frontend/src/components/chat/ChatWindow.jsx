import React, { useRef, useEffect } from 'react';
import { Message } from './Message';
import { LoadingIndicator } from '../common/LoadingIndicator';
import { AlertCircle } from 'lucide-react';

export const ChatWindow = ({ messages = [], isLoading = false, error = null }) => {
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
          question={msg.question}
          answer={msg.answer}
          sources={msg.sources}
          isLast={index === messages.length - 1}
        />
      ))}

      {isLoading && (
        <div style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px'
        }} className="animate-fade-in">
          <LoadingIndicator text="Searching documents & generating answer..." />
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
