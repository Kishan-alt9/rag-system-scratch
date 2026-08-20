import React from 'react';
import { EmptyState } from './EmptyState';
import { ChatWindow } from './ChatWindow';
import { QuestionInput } from './QuestionInput';
import { Trash2, FileText, Sparkles, Menu, AlertCircle, X } from 'lucide-react';

export const MainWorkspace = ({
  messages = [],
  isLoading = false,
  error = null,
  onAskQuestion,
  onClearHistory,
  onSelectPrompt,
  selectedDocName,
  onToggleSidebar,
  operationError,
  onDismissOperationError,
  isConnected,
  activeMessageIndex,
  selectedCitationIndex,
  onSelectSource
}) => {
  return (
    <main style={{
      flex: 1,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-2xl)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-floating)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Top Header Bar inside Main Workspace */}
      <header style={{
        height: '54px',
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
            <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13.5px' }}>
              Research Workspace
            </span>
            {selectedDocName && (
              <span style={{
                fontSize: '11px',
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-accent-subtle)',
                border: '1px solid var(--border-accent)',
                color: 'var(--text-accent)',
                fontWeight: 600
              }}>
                Scoped: {selectedDocName}
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
        flexDirection: 'column',
        zIndex: 10
      }}>
        {operationError && (
          <div style={{
            padding: '12px 20px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--text-error)',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span>{operationError}</span>
            </div>
            <button
              onClick={onDismissOperationError}
              style={{ color: 'var(--text-tertiary)', padding: '2px', display: 'flex', alignItems: 'center' }}
              title="Dismiss error"
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <EmptyState onSelectPrompt={onSelectPrompt} apiOffline={!isConnected} />
        ) : (
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            error={error}
            activeMessageIndex={activeMessageIndex}
            selectedCitationIndex={selectedCitationIndex}
            onSelectSource={onSelectSource}
          />
        )}
      </div>

      {/* Bottom Fixed Question Input Container */}
      <div style={{
        padding: '16px 20px 24px 20px',
        backgroundColor: 'var(--bg-app)',
        borderTop: '1px solid var(--border-subtle)',
        flexShrink: 0,
        zIndex: 10
      }}>
        <QuestionInput
          onSubmit={onAskQuestion}
          isLoading={isLoading}
        />
      </div>
    </main>
  );
};
