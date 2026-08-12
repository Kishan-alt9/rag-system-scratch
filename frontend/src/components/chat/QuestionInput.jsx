import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';

export const QuestionInput = ({ onSubmit, isLoading, disabled, placeholder }) => {
  const [value, setValue] = useState('');
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
    setValue('');
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
        maxWidth: '760px',
        margin: '0 auto',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'relative',
        backgroundColor: 'var(--bg-input)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px 14px 12px 16px',
        boxShadow: 'var(--shadow-elevated)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
      }}
      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-medium)'}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
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
            padding: '2px 0'
          }}
        />

        <button
          type="submit"
          disabled={!value.trim() || isLoading || disabled}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: !value.trim() || isLoading || disabled ? 'rgba(255, 255, 255, 0.05)' : 'var(--accent-primary)',
            color: !value.trim() || isLoading || disabled ? 'var(--text-tertiary)' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            cursor: !value.trim() || isLoading || disabled ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" style={{ width: '18px', height: '18px' }} />
          ) : (
            <ArrowUp style={{ width: '18px', height: '18px' }} />
          )}
        </button>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'between',
        padding: '6px 8px 0 8px',
        fontSize: '11px',
        color: 'var(--text-tertiary)'
      }}>
        <span>Press <kbd style={{ fontFamily: 'var(--font-mono)', padding: '1px 4px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>Enter</kbd> to submit, <kbd style={{ fontFamily: 'var(--font-mono)', padding: '1px 4px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}>Shift + Enter</kbd> for new line</span>
      </div>
    </form>
  );
};
