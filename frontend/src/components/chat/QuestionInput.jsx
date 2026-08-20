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
        maxWidth: '720px',
        margin: '0 auto',
        position: 'relative'
      }}
    >
      <div style={{
        position: 'relative',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '26px',
        padding: '10px 12px 10px 20px',
        boxShadow: '0 16px 36px -8px rgba(37, 99, 235, 0.1), 0 2px 10px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '12px',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.boxShadow = '0 20px 45px -8px rgba(37, 99, 235, 0.18), 0 0 0 3px rgba(59, 130, 246, 0.15)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#cbd5e1';
        e.currentTarget.style.boxShadow = '0 16px 36px -8px rgba(37, 99, 235, 0.1), 0 2px 10px rgba(0, 0, 0, 0.04)';
      }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Ask any question across your document knowledge base...'}
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
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: !value.trim() || isLoading || disabled ? '#e2e8f0' : 'var(--accent-gradient)',
            color: !value.trim() || isLoading || disabled ? '#94a3b8' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            cursor: !value.trim() || isLoading || disabled ? 'not-allowed' : 'pointer',
            boxShadow: !value.trim() || isLoading || disabled ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} />
          ) : (
            <ArrowUp style={{ width: '17px', height: '17px', strokeWidth: 2.5 }} />
          )}
        </button>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px 0 12px',
        fontSize: '11.5px',
        color: 'var(--text-tertiary)'
      }}>
        <span>Press <kbd style={{ fontFamily: 'var(--font-mono)', padding: '1px 6px', borderRadius: '4px', background: '#e2e8f0', color: '#475569', fontWeight: 600 }}>Enter</kbd> to generate answer with verified citations</span>
      </div>
    </form>
  );
};
