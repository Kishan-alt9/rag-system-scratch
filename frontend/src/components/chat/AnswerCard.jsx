import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const AnswerCard = ({ answer }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card" style={{
      padding: '18px 20px',
      position: 'relative',
      backgroundColor: 'var(--bg-card)',
      borderColor: 'var(--border-subtle)',
      boxShadow: 'var(--shadow-card)',
      lineHeight: '1.65',
      fontSize: '14px',
      color: 'var(--text-primary)'
    }}>
      {/* Header Bar inside AnswerCard */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        paddingBottom: '8px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <span style={{
          fontSize: '10.5px',
          fontWeight: 700,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontFamily: 'var(--font-mono)'
        }}>
          SYNTHESIZED ANSWER
        </span>

        <button
          onClick={handleCopy}
          title="Copy answer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: copied ? 'var(--text-success)' : 'var(--text-tertiary)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            transition: 'color 0.2s ease'
          }}
        >
          {copied ? <Check style={{ width: '12px', height: '12px', color: 'var(--text-success)' }} /> : <Copy style={{ width: '12px', height: '12px' }} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Answer Content */}
      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text-primary)' }}>
        {answer}
      </div>
    </div>
  );
};
