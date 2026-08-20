import React from 'react';
import { FileCheck } from 'lucide-react';
import { DocumentItem } from './DocumentItem';

export const DocumentList = ({
  documents = [],
  selectedDoc,
  onSelectDoc,
  onViewDetails,
  onReindex,
  onDelete,
  operationLoading
}) => {
  return (
    <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px 6px 4px'
      }}>
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--text-tertiary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase'
        }}>
          FILES ({documents.length})
        </span>
      </div>

      {/* Document Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {documents.length === 0 ? (
          <div style={{
            padding: '40px 12px',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            fontSize: '12.5px',
            border: '1px dashed rgba(0, 0, 0, 0.05)',
            borderRadius: 'var(--radius-md)'
          }}>
            <FileCheck style={{ width: '24px', height: '24px', margin: '0 auto 8px auto', opacity: 0.3 }} />
            No documents indexed.
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

export default DocumentList;
