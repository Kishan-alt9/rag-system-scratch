import React, { useState } from 'react';
import { EmptyState } from './EmptyState';
import { ChatWindow } from './ChatWindow';
import { QuestionInput } from './QuestionInput';
import { Trash2, Sparkles, AlertCircle, X, RefreshCw } from 'lucide-react';

export const MainWorkspace = ({
  messages = [],
  isLoading = false,
  error = null,
  onAskQuestion,
  onClearHistory,
  onSelectPrompt,
  selectedDocName,
  operationError,
  onDismissOperationError,
  isConnected,
  onCitationClick
}) => {
  // Manage controlled input state for pre-filling capability
  const [inputValue, setInputValue] = useState('');

  const handleSelectPrompt = (promptText) => {
    // Pre-fill the input field but do not automatically submit (as requested)
    setInputValue(promptText);
    if (onSelectPrompt) {
      onSelectPrompt(promptText);
    }
  };

  return (
    <main style={{
      flex: 1,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Top Workspace Header Bar */}
      <header style={{
        height: '56px',
        padding: '0 24px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        backgroundColor: '#ffffff',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Sparkles style={{ width: '14px', height: '14px', color: 'var(--accent-indigo)' }} />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13.5px' }}>
              Research Workspace
            </span>
            {selectedDocName && (
              <span style={{
                fontSize: '10px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-bg-subtle)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-indigo)',
                fontWeight: 600
              }}>
                Scoped: {selectedDocName}
              </span>
            )}
          </div>
        </div>

        {/* Clear and Actions Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
              title="Clear Chat History"
            >
              <Trash2 style={{ width: '13px', height: '13px' }} />
              <span>Clear conversation</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Chat/Empty Workspace Panel */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10
      }}>
        {operationError && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: 'rgba(244, 63, 94, 0.05)',
            borderBottom: '1px solid rgba(244, 63, 94, 0.1)',
            color: 'var(--text-error)',
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle style={{ width: '15px', height: '15px', flexShrink: 0 }} />
              <span>{operationError}</span>
            </div>
            <button
              onClick={onDismissOperationError}
              style={{ color: 'var(--text-tertiary)', padding: '2px', display: 'flex', alignItems: 'center' }}
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <EmptyState onSelectPrompt={handleSelectPrompt} apiOffline={!isConnected} />
        ) : (
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            error={error}
            onCitationClick={onCitationClick}
          />
        )}
      </div>

      {/* Bottom Floating Question Input Container */}
      <div style={{
        padding: '16px 24px 24px 24px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-subtle)',
        flexShrink: 0,
        zIndex: 10
      }}>
        <QuestionInput
          onSubmit={onAskQuestion}
          isLoading={isLoading}
          value={inputValue}
          onChange={setInputValue}
        />
      </div>
    </main>
  );
};

export default MainWorkspace;
