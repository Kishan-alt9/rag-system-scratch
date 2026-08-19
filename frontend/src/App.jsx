import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Sidebar } from './components/layout/Sidebar';
import { MainWorkspace } from './components/chat/MainWorkspace';
import { UploadModal } from './components/documents/UploadModal';
import { DocumentDetailsModal } from './components/documents/DocumentDetailsModal';
import { api } from './services/api';

export function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [statusInfo, setStatusInfo] = useState({ total_chunks: 0, document_count: 0 });
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Modals & overlay states
  const [detailsDoc, setDetailsDoc] = useState(null);
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState(null);
  
  // Operation states (delete / reindex background loading and errors)
  const [operationLoading, setOperationLoading] = useState(null); // { type: 'deleting' | 'reindexing', docName: string }
  const [operationError, setOperationError] = useState(null);

  const reindexInputRef = useRef(null);
  const [reindexTarget, setReindexTarget] = useState(null);

  // Fetch backend connection status & documents on mount and periodically
  const refreshBackendData = async () => {
    try {
      const health = await api.checkHealth();
      setIsConnected(health.isConnected);

      if (health.isConnected) {
        const docData = await api.getDocuments();
        if (docData && docData.documents) {
          setDocuments(docData.documents);
        }

        const statusData = await api.getStatus();
        if (statusData) {
          setStatusInfo({
            total_chunks: statusData.chunk_count || 0,
            document_count: statusData.document_count || 0
          });
        }
      } else {
        setDocuments([]);
        setStatusInfo({ total_chunks: 0, document_count: 0 });
      }
    } catch (err) {
      setIsConnected(false);
      setDocuments([]);
      setStatusInfo({ total_chunks: 0, document_count: 0 });
    }
  };

  useEffect(() => {
    refreshBackendData();
    const interval = setInterval(refreshBackendData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle Question Submission
  const handleAskQuestion = async (questionText) => {
    if (!questionText.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await api.askQuestion(questionText);
      
      const newTurn = {
        question: questionText,
        answer: response.answer,
        sources: response.sources || []
      };

      setMessages((prev) => [...prev, newTurn]);
    } catch (err) {
      setError(err.message || 'An error occurred while connecting to the RAG backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle PDF Upload Integration
  const handleUploadDocument = async (file) => {
    try {
      await api.uploadDocument(file);
      await refreshBackendData();
    } catch (err) {
      throw err;
    }
  };

  // Handle Document Delete
  const handleDeleteClick = (doc) => {
    setDeleteConfirmDoc(doc);
  };

  const handleDeleteConfirm = async (doc) => {
    const docId = doc.id || doc.name;
    setOperationLoading({ type: 'deleting', docName: doc.name });
    setOperationError(null);

    try {
      await api.deleteDocument(docId);
      await refreshBackendData();
    } catch (err) {
      setOperationError(`Failed to delete document "${doc.name}": ${err.message}`);
    } finally {
      setOperationLoading(null);
    }
  };

  // Handle Document Reindex
  const handleReindexClick = (doc) => {
    setReindexTarget(doc);
    if (reindexInputRef.current) {
      reindexInputRef.current.value = ''; // Reset file input
      reindexInputRef.current.click();
    }
  };

  const handleReindexFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !reindexTarget) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setOperationError('Only PDF files are supported for re-indexing.');
      setReindexTarget(null);
      return;
    }

    const docId = reindexTarget.id || reindexTarget.name;
    const targetName = reindexTarget.name;

    setOperationLoading({ type: 'reindexing', docName: targetName });
    setOperationError(null);
    setReindexTarget(null);

    try {
      await api.reindexDocument(docId, file);
      await refreshBackendData();
    } catch (err) {
      setOperationError(`Failed to re-index document "${targetName}": ${err.message}`);
    } finally {
      setOperationLoading(null);
    }
  };

  return (
    <AppShell>
      <Sidebar
        isConnected={isConnected}
        documents={documents}
        selectedDoc={selectedDoc}
        onSelectDoc={(name) => setSelectedDoc(selectedDoc === name ? null : name)}
        onAddClick={() => setIsUploadOpen(true)}
        totalChunks={statusInfo.total_chunks}
        documentCount={statusInfo.document_count}
        onViewDetails={(doc) => setDetailsDoc(doc)}
        onReindex={handleReindexClick}
        onDelete={handleDeleteClick}
        operationLoading={operationLoading}
      />

      <MainWorkspace
        messages={messages}
        isLoading={isLoading}
        error={error}
        onAskQuestion={handleAskQuestion}
        onClearHistory={() => setMessages([])}
        onSelectPrompt={handleAskQuestion}
        selectedDocName={selectedDoc}
        operationError={operationError}
        onDismissOperationError={() => setOperationError(null)}
        isConnected={isConnected}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadDocument}
      />

      <DocumentDetailsModal
        isOpen={!!detailsDoc}
        onClose={() => setDetailsDoc(null)}
        document={detailsDoc}
      />

      {/* Hidden file input for re-indexing trigger */}
      <input
        type="file"
        ref={reindexInputRef}
        onChange={handleReindexFileChange}
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
      />

      {/* Delete Confirmation Overlay */}
      {deleteConfirmDoc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '20px'
        }} className="animate-fade-in" onClick={() => setDeleteConfirmDoc(null)}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-elevated)',
            padding: '20px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Confirm Deletion
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
              Are you sure you want to delete <strong>{deleteConfirmDoc.name}</strong>? This action will remove all vector storage index chunks associated with this file.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirmDoc(null)}
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'transparent'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteConfirm(deleteConfirmDoc);
                  setDeleteConfirmDoc(null);
                }}
                style={{
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#ffffff',
                  backgroundColor: 'var(--text-error)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default App;
