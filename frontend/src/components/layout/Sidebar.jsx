import React from 'react';
import { DocumentList } from '../documents/DocumentList';
import { IndexStatus } from '../documents/IndexStatus';
import { BookOpen } from 'lucide-react';

export const Sidebar = ({
  isConnected,
  documents,
  selectedDoc,
  onSelectDoc,
  onAddClick,
  totalChunks,
  documentCount,
  onViewDetails,
  onReindex,
  onDelete,
  operationLoading
}) => {
  return (
    <aside style={{
      width: '290px',
      height: '100%',
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-floating)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden'
    }}>
      {/* Knowledge Library Title */}
      <div style={{
        height: '54px',
        padding: '0 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: '#ffffff',
        flexShrink: 0
      }}>
        <BookOpen style={{ width: '16px', height: '16px', color: 'var(--text-accent)' }} />
        <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
          Knowledge Library
        </span>
      </div>

      <DocumentList
        documents={documents}
        selectedDoc={selectedDoc}
        onSelectDoc={onSelectDoc}
        onAddClick={onAddClick}
        onViewDetails={onViewDetails}
        onReindex={onReindex}
        onDelete={onDelete}
        operationLoading={operationLoading}
      />

      <IndexStatus
        totalChunks={totalChunks}
        documentCount={documentCount}
        isReady={isConnected}
      />
    </aside>
  );
};
