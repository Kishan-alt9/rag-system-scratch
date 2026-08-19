import React from 'react';
import { Plus, FileCheck } from 'lucide-react';
import { DocumentItem } from './DocumentItem';

export const DocumentList = ({
  documents = [],
  selectedDoc,
  onSelectDoc,
  onAddClick,
  onViewDetails,
  onReindex,
  onDelete,
  operationLoading
}) => {
  return (
    <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
      {/* Header & Add Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase'
        }}>
          DOCUMENTS
        </span>
      </div>

      {/* Obvious + Add documents button */}
      <button
        onClick={onAddClick}
        style={{
          width: '100%',
          padding: '10px 14px',
          marginBottom: '16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px dashed rgba(59, 130, 246, 0.3)',
          color: 'var(--text-accent)',
          fontSize: '13px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
        }}
      >
        <Plus style={{ width: '16px', height: '16px' }} />
        <span>+ Add documents</span>
      </button>

      {/* Document Items List */}
      <div>
        {documents.length === 0 ? (
          <div style={{
            padding: '24px 12px',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: '13px'
          }}>
            <FileCheck style={{ width: '28px', height: '28px', margin: '0 auto 8px auto', opacity: 0.4 }} />
            No indexed documents yet.
          </div>
        ) : (
          documents.map((doc) => (
            <DocumentItem
              key={doc.name}
              document={doc}
              isSelected={selectedDoc === doc.name}
              onSelect={onSelectDoc}
              onViewDetails={onViewDetails}
              onReindex={onReindex}
              onDelete={onDelete}
              loadingAction={operationLoading && operationLoading.docName === doc.name ? operationLoading.type : null}
            />
          ))
        )}
      </div>
    </div>
  );
};
