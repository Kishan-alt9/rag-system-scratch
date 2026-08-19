import React from 'react';
import { MessageSquare, Plus } from 'lucide-react';

export const ThreadList = ({ currentThreadCount = 0, onNewThread }) => {
  return (
    <div style={{
      padding: '12px 16px',
      borderTop: '1px solid var(--border-subtle)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          Threads
        </span>

        {currentThreadCount > 0 && (
          <button
            onClick={onNewThread}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              color: 'var(--text-accent)',
              cursor: 'pointer'
            }}
            title="Start new thread session"
          >
            <Plus style={{ width: '12px', height: '12px' }} />
            <span>New thread</span>
          </button>
        )}
      </div>

      {currentThreadCount > 0 ? (
        <div style={{
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-surface-active)',
          borderLeft: '2px solid var(--border-focus)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12.5px',
          color: 'var(--text-primary)',
          fontWeight: 500
        }}>
          <MessageSquare style={{ width: '13px', height: '13px', color: 'var(--text-accent)', flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Current Analysis Thread
          </span>
        </div>
      ) : (
        <div style={{
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-app)',
          border: '1px dashed var(--border-subtle)',
          fontSize: '11.5px',
          color: 'var(--text-tertiary)',
          lineHeight: '1.4'
        }}>
          <div>No saved threads</div>
          <div style={{ fontSize: '10.5px', opacity: 0.75, marginTop: '2px' }}>
            Thread persistence pending backend update.
          </div>
        </div>
      )}
    </div>
  );
};
