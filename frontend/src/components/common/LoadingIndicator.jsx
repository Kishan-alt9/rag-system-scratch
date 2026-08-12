import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingIndicator = ({ text = 'Generating answer...', size = 'md' }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
      <Loader2 className="animate-spin" style={{ width: size === 'sm' ? 16 : 20, height: size === 'sm' ? 16 : 20, color: 'var(--accent-primary)' }} />
      <span style={{ fontSize: size === 'sm' ? '13px' : '14px', fontWeight: 500 }}>{text}</span>
    </div>
  );
};
