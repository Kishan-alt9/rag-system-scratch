import React from 'react';
import { Layers, Plus, Check, Sparkles, Database } from 'lucide-react';

export const TopNavbar = ({
  isConnected = true,
  totalChunks = 0,
  documentCount = 0,
  onAddClick
}) => {
  return (
    <header style={{
      height: '58px',
      backgroundColor: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      flexShrink: 0,
      zIndex: 20
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
        }}>
          <Layers style={{ width: '18px', height: '18px' }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              RAG Workspace
            </span>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              padding: '1px 6px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-accent-subtle)',
              color: 'var(--text-accent)'
            }}>
              AI
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
            Document Intelligence Platform
          </div>
        </div>
      </div>

      {/* Center Architecture Pill */}
      <div style={{
        display: 'none',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: '#f8fafc',
        border: '1px solid var(--border-subtle)',
        fontSize: '12px',
        color: 'var(--text-secondary)'
      }} className="md-flex">
        <Sparkles style={{ width: '14px', height: '14px', color: 'var(--text-accent)' }} />
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>RAG Pipeline:</span>
        <span>Dense FAISS Embeddings + Cross-Encoder Reranking</span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: isConnected ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${isConnected ? '#a7f3d0' : '#fecaca'}`,
          fontSize: '11.5px',
          fontWeight: 600,
          color: isConnected ? '#059669' : '#dc2626'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#ef4444'
          }} />
          <span>{isConnected ? 'Backend Active' : 'Offline'}</span>
        </div>

        {/* Chunks Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: '#f8fafc',
          border: '1px solid var(--border-subtle)',
          fontSize: '11.5px',
          fontWeight: 600,
          color: 'var(--text-secondary)'
        }}>
          <Database style={{ width: '13px', height: '13px', color: 'var(--text-tertiary)' }} />
          <span>{totalChunks} Chunks ({documentCount} {documentCount === 1 ? 'Doc' : 'Docs'})</span>
        </div>

        {/* Index Document Button */}
        <button
          onClick={onAddClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)',
            color: '#ffffff',
            fontSize: '12.5px',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <Plus style={{ width: '15px', height: '15px', strokeWidth: 2.5 }} />
          <span>Index PDF</span>
        </button>
      </div>
    </header>
  );
};
