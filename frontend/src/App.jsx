import React, { useState, useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Sidebar } from './components/layout/Sidebar';
import { MainWorkspace } from './components/chat/MainWorkspace';
import { UploadModal } from './components/documents/UploadModal';
import { api } from './services/api';

export function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [statusInfo, setStatusInfo] = useState({ total_chunks: 63, document_count: 1 });
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Fetch backend connection status & documents on mount and periodically
  const refreshBackendData = async () => {
    const health = await api.checkHealth();
    setIsConnected(health.isConnected);

    const docData = await api.getDocuments();
    if (docData.documents) {
      setDocuments(docData.documents);
    }

    const statusData = await api.getStatus();
    if (statusData) {
      setStatusInfo({
        total_chunks: statusData.chunk_count || 63,
        document_count: statusData.document_count || (docData.documents ? docData.documents.length : 1)
      });
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
      />

      <MainWorkspace
        messages={messages}
        isLoading={isLoading}
        error={error}
        onAskQuestion={handleAskQuestion}
        onClearHistory={() => setMessages([])}
        onSelectPrompt={handleAskQuestion}
        selectedDocName={selectedDoc}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadDocument}
      />
    </AppShell>
  );
}

export default App;
