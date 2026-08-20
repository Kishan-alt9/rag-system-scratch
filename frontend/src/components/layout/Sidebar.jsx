import React from 'react';
import { DocumentList } from '../documents/DocumentList';
import { Layers, Plus, Database, Sparkles, BookOpen } from 'lucide-react';

export const Sidebar = ({
  isConnected,
  documents = [],
  selectedDoc,
  onSelectDoc,
  onAddClick,
  totalChunks = 0,
  documentCount = 0,
  onViewDetails,
  onReindex,
  onDelete,
  operationLoading
}) => {
  return (
    <aside style={{
      width: '320px',
      height: '100%',
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflow: 'hidden'
    }}>
      {/* Branding and Connection Status */}
      <div style={{
        padding: '24px 20px 16px 20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)'
            }}>
              <Layers style={{ width: '16px', height: '16px' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                RAG Workspace
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                Knowledge Platform
              </div>
            </div>
          </div>

          {/* Connection Status Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isConnected ? '#ecfdf5' : '#fef2f2',
            border: `1px solid ${isConnected ? '#a7f3d0' : '#fecaca'}`,
            fontSize: '10px',
            fontWeight: 600,
            color: isConnected ? '#059669' : '#dc2626'
          }}>
            <span style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#10b981' : '#ef4444'
            }} />
            <span>{isConnected ? 'Active' : 'Offline'}</span>
          </div>
        </div>

        {/* Database statistics badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}>
          <Database style={{ width: '13px', height: '13px', color: 'var(--text-tertiary)' }} />
          <span style={{ fontWeight: 600 }}>{documentCount} {documentCount === 1 ? 'document' : 'documents'}</span>
          <span style={{ color: 'var(--text-tertiary)' }}>•</span>
          <span>{totalChunks} chunks</span>
        </div>
      </div>

      {/* Document Actions & List Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '16px 8px'
      }}>
        {/* Compact elegant Index Button */}
        <div style={{ padding: '0 12px 12px 12px' }}>
          <button
            onClick={onAddClick}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Plus style={{ width: '15px', height: '15px', strokeWidth: 2.5 }} />
            <span>Index PDF Document</span>
          </button>
        </div>

        {/* Scrolling list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
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
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
