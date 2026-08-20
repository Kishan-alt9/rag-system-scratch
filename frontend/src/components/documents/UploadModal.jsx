import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react';

export const UploadModal = ({ isOpen, onClose, onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateAndAddFiles = (files) => {
    const validPdfs = [];
    let err = '';

    Array.from(files).forEach((file) => {
      if (!file.name.toLowerCase().endswith?.('.pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        err = 'Only PDF documents are supported.';
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        err = 'File size must be under 50MB.';
        return;
      }
      validPdfs.push(file);
    });

    if (err) setErrorMessage(err);
    else setErrorMessage('');

    if (validPdfs.length > 0) {
      setSelectedFiles((prev) => {
        const existingNames = new Set(prev.map(f => f.name));
        const filtered = validPdfs.filter(f => !existingNames.has(f.name));
        return [...prev, ...filtered];
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      validateAndAddFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;

    setUploadState('uploading');
    setProgress(15);
    setErrorMessage('');

    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 85 ? prev : prev + 15));
    }, 300);

    try {
      // Send each file to backend
      for (const file of selectedFiles) {
        if (onUploadSuccess) {
          await onUploadSuccess(file);
        }
      }
      clearInterval(interval);
      setProgress(100);
      setUploadState('success');

      setTimeout(() => {
        setUploadState('idle');
        setSelectedFiles([]);
        setProgress(0);
        onClose();
      }, 1200);
    } catch (err) {
      clearInterval(interval);
      setUploadState('error');
      setErrorMessage(err.message || 'Failed to upload and index documents.');
    }
  };

  return (
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
      zIndex: 100,
      padding: '20px'
    }}>
      <div 
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-elevated)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Add PDF Documents
          </h2>
          <button
            onClick={onClose}
            style={{
              color: 'var(--text-tertiary)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px' }}>
          {/* Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-medium)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '30px 20px',
              textAlign: 'center',
              backgroundColor: isDragging ? 'var(--bg-accent-subtle)' : 'var(--bg-app)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,application/pdf"
              multiple
              style={{ display: 'none' }}
            />
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              color: 'var(--text-accent)'
            }}>
              <UploadCloud style={{ width: '24px', height: '24px' }} />
            </div>

            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Drop PDF files here or browse your computer
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              PDF documents only • Max 50MB
            </p>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              style={{
                marginTop: '14px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-card-hover)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              Browse files
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div style={{
              marginTop: '12px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--text-error)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Selected Files ({selectedFiles.length})
              </div>
              <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      marginBottom: '6px',
                      backgroundColor: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <FileText style={{ width: '16px', height: '16px', color: '#f87171', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', flexShrink: 0 }}>
                        ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    </div>

                    {uploadState === 'idle' && (
                      <button
                        onClick={() => removeFile(index)}
                        style={{ color: 'var(--text-tertiary)', padding: '2px' }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {uploadState === 'uploading' && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                <span>Uploading & Indexing...</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--accent-primary)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          {/* Success indicator */}
          {uploadState === 'success' && (
            <div style={{
              marginTop: '16px',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: 'var(--text-success)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 style={{ width: '18px', height: '18px' }} />
              <span>Document indexed successfully!</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            onClick={onClose}
            disabled={uploadState === 'uploading'}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              backgroundColor: 'transparent',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUploadSubmit}
            disabled={selectedFiles.length === 0 || uploadState === 'uploading'}
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: 600,
              color: selectedFiles.length === 0 || uploadState === 'uploading' ? 'var(--text-tertiary)' : '#080b12',
              backgroundColor: selectedFiles.length === 0 || uploadState === 'uploading' ? 'rgba(255, 255, 255, 0.05)' : 'var(--accent-primary)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: selectedFiles.length === 0 || uploadState === 'uploading' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {uploadState === 'uploading' && <Loader2 className="animate-spin" style={{ width: '14px', height: '14px' }} />}
            <span>{uploadState === 'uploading' ? 'Indexing...' : 'Index Documents'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
