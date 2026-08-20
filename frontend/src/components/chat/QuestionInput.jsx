import React, { useRef, useEffect } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';

export const QuestionInput = ({ onSubmit, isLoading, disabled, placeholder, value = '', onChange }) => {
  const textareaRef = useRef(null);

  // Auto-resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [value]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!value.trim() || isLoading || disabled) return;

    onSubmit(value.trim());
    if (onChange) {
      onChange('');
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: '100%',
        maxWidth: '720px',
        margin: '0 auto',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'relative',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        borderRadius: '24px',
        padding: '10px 12px 10px 20px',
        boxShadow: 'var(--shadow-floating)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-indigo)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow), 0 0 0 3px rgba(99, 102, 241, 0.15)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.boxShadow = 'var(--shadow-floating)';
      }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Ask anything about your documents...'}
          disabled={isLoading || disabled}
          rows={1}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '14.5px',
            lineHeight: '1.5',
            fontFamily: 'var(--font-sans)',
            resize: 'none',
            maxHeight: '180px',
            padding: '6px 0'
          }}
        />

        <button
          type="submit"
          disabled={!value.trim() || isLoading || disabled}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: !value.trim() || isLoading || disabled ? '#f1f5f9' : 'var(--accent-gradient)',
            color: !value.trim() || isLoading || disabled ? '#94a3b8' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: !value.trim() || isLoading || disabled ? 'not-allowed' : 'pointer',
            boxShadow: !value.trim() || isLoading || disabled ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.25)'
          }}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" style={{ width: '15px', height: '15px' }} />
          ) : (
            <ArrowUp style={{ width: '16px', height: '16px', strokeWidth: 2.5 }} />
          )}
        </button>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px 0 12px',
        fontSize: '11px',
        color: 'var(--text-tertiary)'
      }}>
        <span>Press <kbd style={{ fontFamily: 'var(--font-mono)', padding: '1px 5px', borderRadius: '4px', background: '#f1f5f9', color: 'var(--text-secondary)', fontWeight: 600 }}>Enter</kbd> to ask RAG assistant</span>
      </div>
    </form>
  );
};

export default QuestionInput;
