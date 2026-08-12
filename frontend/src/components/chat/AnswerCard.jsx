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
      padding: '20px',
      position: 'relative',
      backgroundColor: 'var(--bg-card)',
      borderColor: 'var(--border-subtle)',
      lineHeight: '1.7',
      fontSize: '14.5px',
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
        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          DOCUMENT ANSWER
        </span>

        <button
          onClick={handleCopy}
          title="Copy answer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)'
          }}
        >
          {copied ? <Check style={{ width: '13px', height: '13px', color: 'var(--text-success)' }} /> : <Copy style={{ width: '13px', height: '13px' }} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Answer Content */}
      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {answer}
      </div>
    </div>
  );
};
