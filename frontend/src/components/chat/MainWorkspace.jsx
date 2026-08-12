import React from 'react';
import { EmptyState } from './EmptyState';
import { ChatWindow } from './ChatWindow';
import { QuestionInput } from './QuestionInput';
import { Trash2, FileText, Sparkles, Menu } from 'lucide-react';

export const MainWorkspace = ({
  messages = [],
  isLoading = false,
  error = null,
  onAskQuestion,
  onClearHistory,
  onSelectPrompt,
  selectedDocName,
  onToggleSidebar
}) => {
  return (
    <main style={{
      flex: 1,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-app)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Top Header Bar */}
      <header style={{
        height: '56px',
        padding: '0 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        backgroundColor: 'var(--bg-app)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
            >
              <Menu style={{ width: '20px', height: '20px' }} />
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Sparkles style={{ width: '15px', height: '15px', color: 'var(--text-accent)' }} />
            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
              Document Intelligence Mode
            </span>
            {selectedDocName && (
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                color: 'var(--text-accent)'
              }}>
                Scope: {selectedDocName}
              </span>
            )}
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClearHistory}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-tertiary)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'transparent',
              transition: 'color 0.2s ease'
            }}
            title="Clear Chat History"
          >
            <Trash2 style={{ width: '14px', height: '14px' }} />
            <span>Clear conversation</span>
          </button>
        )}
      </header>

      {/* Main Workspace Body */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.length === 0 ? (
          <EmptyState onSelectPrompt={onSelectPrompt} />
        ) : (
          <ChatWindow messages={messages} isLoading={isLoading} error={error} />
        )}
      </div>

      {/* Bottom Fixed Question Input Container */}
      <div style={{
        padding: '16px 20px 24px 20px',
        backgroundColor: 'var(--bg-app)',
        borderTop: '1px solid var(--border-subtle)',
        flexShrink: 0
      }}>
        <QuestionInput
          onSubmit={onAskQuestion}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
};
