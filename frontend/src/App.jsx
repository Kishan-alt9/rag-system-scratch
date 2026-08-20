import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Sidebar } from './components/layout/Sidebar';
import { MainWorkspace } from './components/chat/MainWorkspace';
import { UploadModal } from './components/documents/UploadModal';
import { DocumentDetailsModal } from './components/documents/DocumentDetailsModal';
import { CitationPopover } from './components/chat/CitationPopover';
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

  // Absolute citation popover state: { messageIndex, citationId, rect, source }
  const [activeCitationPopover, setActiveCitationPopover] = useState(null);

  // Close popover when clicking anywhere else
  useEffect(() => {
    const handleClose = () => setActiveCitationPopover(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

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

    setActiveCitationPopover(null); // Clear any active popover
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.askQuestion(questionText);
      
      // Determine if the answer indicates failure/missing answer
      const answerText = response.answer || "";
      const isNoAnswer = answerText.toLowerCase().includes("couldn't find the answer") ||
                         answerText.toLowerCase().includes("could not find the answer") ||
                         answerText === "I couldn't find the answer in the provided document.";

      const newTurn = {
        question: questionText,
        answer: isNoAnswer ? "I couldn't find the answer in the provided document." : answerText,
        sources: isNoAnswer ? [] : (response.sources || []),
        noSourcesFound: isNoAnswer
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

  // Handle Click on Inline Citation Badge
  const handleCitationClick = (msgIndex, citationId, elementRect) => {
    const turn = messages[msgIndex];
    if (!turn || !turn.sources) return;

    // Use backend citation_id as source of truth
    const matchedSource = turn.sources.find(src => 
      String(src.citation_id).toUpperCase() === String(citationId).toUpperCase() ||
      String(src.citation_id).toUpperCase() === `S${citationId}`.toUpperCase()
    );

    if (matchedSource) {
      setActiveCitationPopover({
        messageIndex: msgIndex,
        citationId,
        rect: elementRect,
        source: matchedSource
      });
    }
  };

  return (
    <AppShell>
      {/* Two-Pane Layout */}
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
        onClearHistory={() => {
          setMessages([]);
          setActiveCitationPopover(null);
        }}
        onSelectPrompt={(promptText) => {
          // Pre-fill text inside QuestionInput or submit
          // The prompt says: "Quick prompts should pre-fill the input but never automatically submit."
          // We will handle this inside QuestionInput by exposing a value/setMethod or pre-fill state.
        }}
        selectedDocName={selectedDoc}
        operationError={operationError}
        onDismissOperationError={() => setOperationError(null)}
        isConnected={isConnected}
        onCitationClick={handleCitationClick}
        activeCitationPopoverId={activeCitationPopover ? `${activeCitationPopover.messageIndex}-${activeCitationPopover.citationId}` : null}
      />

      {/* Floating Citation Popover */}
      {activeCitationPopover && (
        <CitationPopover
          source={activeCitationPopover.source}
          rect={activeCitationPopover.rect}
          onClose={() => setActiveCitationPopover(null)}
        />
      )}

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
          backgroundColor: 'rgba(15, 23, 42, 0.15)',
          backdropFilter: 'blur(8px)',
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
            border: '1px solid rgba(0, 0, 0, 0.05)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-floating)',
            padding: '24px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Delete Document
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '24px' }}>
              Are you sure you want to delete <strong>{deleteConfirmDoc.name}</strong>? This action will permanently remove all associated vector indexes.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirmDoc(null)}
                style={{
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--radius-md)',
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
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: 'var(--text-error)',
                  borderRadius: 'var(--radius-md)'
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
