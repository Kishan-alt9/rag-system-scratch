import React from 'react';
import { Branding } from './Branding';
import { DocumentList } from '../documents/DocumentList';
import { IndexStatus } from '../documents/IndexStatus';
import { ThreadList } from './ThreadList';

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
      width: '280px',
      height: '100%',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      <Branding isConnected={isConnected} />

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

      <ThreadList currentThreadCount={0} />

      <IndexStatus
        totalChunks={totalChunks}
        documentCount={documentCount}
        isReady={isConnected}
      />
    </aside>
  );
};
