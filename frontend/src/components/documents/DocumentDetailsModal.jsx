import React, { useEffect } from 'react';
import { X, FileText, CheckCircle2, ShieldCheck, Database, Layers, Calendar, Hash } from 'lucide-react';

export const DocumentDetailsModal = ({ isOpen, onClose, document }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !document) return null;

  const { name, pages, chunks, page_count, chunk_count, status, id, indexed_at, ocr_status } = document;
  const pageDisplay = page_count || pages || 'N/A';
  const chunkDisplay = chunk_count || chunks || 'N/A';
  const docId = id || name;
  const statusDisplay = status || 'indexed';
  const ocrDisplay = ocr_status || 'Text Extracted';
  const dateDisplay = indexed_at ? new Date(indexed_at).toLocaleString() : 'N/A';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }} onClick={onClose} className="animate-fade-in">
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-elevated)',
        overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-app)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText style={{ width: '16px', height: '16px', color: 'var(--text-accent)' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Document Technical Overview
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-tertiary)', padding: '4px', borderRadius: 'var(--radius-sm)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Document Header Info */}
        <div style={{ padding: '20px' }}>
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <FileText style={{ width: '20px', height: '20px', color: 'var(--text-secondary)', flexShrink: 0 }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', truncate: true }}>
                {name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Technical Metadata & Vector Storage Specifications
              </div>
            </div>
          </div>

          {/* Technical Metadata Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={rowStyle}>
              <div style={labelStyle}>
                <Hash style={{ width: '13px', height: '13px' }} />
                <span>Document ID</span>
              </div>
              <span style={monoValueStyle}>{docId}</span>
            </div>

            <div style={rowStyle}>
              <div style={labelStyle}>
                <Layers style={{ width: '13px', height: '13px' }} />
                <span>Pages Count</span>
              </div>
              <span style={monoValueStyle}>{pageDisplay}</span>
            </div>

            <div style={rowStyle}>
              <div style={labelStyle}>
                <Database style={{ width: '13px', height: '13px' }} />
                <span>Index Chunks</span>
              </div>
              <span style={monoValueStyle}>{chunkDisplay}</span>
            </div>

            <div style={rowStyle}>
              <div style={labelStyle}>
                <CheckCircle2 style={{ width: '13px', height: '13px' }} />
                <span>Indexing Status</span>
              </div>
              <span style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: 'var(--text-success)',
                backgroundColor: 'rgba(52, 211, 153, 0.08)',
                padding: '1px 7px',
                borderRadius: 'var(--radius-sm)'
              }}>
                {statusDisplay}
              </span>
            </div>

            <div style={rowStyle}>
              <div style={labelStyle}>
                <ShieldCheck style={{ width: '13px', height: '13px' }} />
                <span>OCR Pipeline</span>
              </div>
              <span style={valueStyle}>{ocrDisplay}</span>
            </div>

            <div style={rowStyle}>
              <div style={labelStyle}>
                <Calendar style={{ width: '13px', height: '13px' }} />
                <span>Indexed Timestamp</span>
              </div>
              <span style={monoValueStyle}>{dateDisplay}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          backgroundColor: 'var(--bg-app)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 10px',
  borderRadius: 'var(--radius-sm)',
  backgroundColor: 'var(--bg-app)',
  border: '1px solid var(--border-subtle)',
  gap: '12px'
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
  flexShrink: 0
};

const valueStyle = {
  fontSize: '12px',
  color: 'var(--text-primary)',
  textAlign: 'right'
};

const monoValueStyle = {
  fontSize: '11.5px',
  fontFamily: 'var(--font-mono)',
  color: 'var(--text-primary)',
  wordBreak: 'break-all',
  textAlign: 'right',
  maxHeight: '40px',
  overflowY: 'auto'
};
