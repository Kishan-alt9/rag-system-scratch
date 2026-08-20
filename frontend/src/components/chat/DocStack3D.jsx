import React from 'react';
import { FileText, Cpu, Check, Layers, Network, Link2 } from 'lucide-react';

export const DocStack3D = () => {
  return (
    <div style={{
      position: 'relative',
      width: '380px',
      height: '220px',
      margin: '20px auto',
      perspective: '1400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Background Soft Glow Aura */}
      <div style={{
        position: 'absolute',
        width: '280px',
        height: '140px',
        background: 'radial-gradient(ellipse, rgba(99, 102, 241, 0.18) 0%, rgba(59, 130, 246, 0.08) 55%, transparent 75%)',
        filter: 'blur(24px)',
        pointerEvents: 'none',
        zIndex: 1
      }} />

      {/* Layer 1: Bottom base (Grid/Connections) */}
      <div style={{
        position: 'absolute',
        transform: 'rotateX(55deg) rotateZ(-30deg) translateZ(-40px)',
        width: '240px',
        height: '160px',
        borderRadius: '24px',
        border: '1px dashed rgba(99, 102, 241, 0.25)',
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(2px)',
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Subtle grid points */}
        <div style={{
          position: 'absolute',
          width: '80%',
          height: '80%',
          backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.15) 1px, transparent 0)',
          backgroundSize: '16px 16px'
        }} />
        <Network style={{ width: '32px', height: '32px', color: 'rgba(99, 102, 241, 0.3)', strokeWidth: 1.5 }} />
      </div>

      {/* Layer 2: Mid-Level Retrieval Vector Node */}
      <div style={{
        position: 'absolute',
        transform: 'rotateX(55deg) rotateZ(-30deg) translateZ(-10px)',
        width: '210px',
        height: '130px',
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.04)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 3
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: '45%', height: '6px', borderRadius: '3px', backgroundColor: '#e2e8f0' }} />
          <span style={{
            fontSize: '8px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: 'var(--accent-indigo)',
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            padding: '1px 5px',
            borderRadius: '4px'
          }}>
            EMBEDDINGS
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ width: '90%', height: '4px', borderRadius: '2px', backgroundColor: '#f1f5f9' }} />
          <div style={{ width: '75%', height: '4px', borderRadius: '2px', backgroundColor: '#f1f5f9' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Link2 style={{ width: '12px', height: '12px', color: 'var(--accent-blue)' }} />
          <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-tertiary)' }}>FAISS Vector Index</span>
        </div>
      </div>

      {/* Layer 3: Top Floating Verified Knowledge Document */}
      <div className="animate-float" style={{
        position: 'absolute',
        transform: 'rotateX(55deg) rotateZ(-30deg) translateZ(25px)',
        width: '230px',
        height: '140px',
        backgroundColor: '#ffffff',
        borderRadius: '18px',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        boxShadow: '0 20px 40px rgba(99, 102, 241, 0.12), 0 0 1px 1px rgba(99, 102, 241, 0.1)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 4
      }}>
        {/* Document Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-indigo)'
            }}>
              <FileText style={{ width: '13px', height: '13px' }} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Knowledge Store
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>
                Verified Sources
              </div>
            </div>
          </div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            fontSize: '9px',
            fontWeight: 700,
            color: 'var(--text-success)',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            padding: '1px 5px',
            borderRadius: '5px'
          }}>
            <Check style={{ width: '8px', height: '8px', strokeWidth: 3 }} />
            Ready
          </span>
        </div>

        {/* Chunks stack details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ width: '100%', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(99, 102, 241, 0.05)' }} />
          <div style={{ width: '80%', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(99, 102, 241, 0.05)' }} />
        </div>

        {/* Bottom indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9.5px', color: 'var(--accent-indigo)', fontWeight: 700 }}>
            <Cpu style={{ width: '11px', height: '11px' }} />
            <span>Augmented Context</span>
          </div>
          <span style={{
            fontSize: '8.5px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'var(--accent-indigo)',
            color: '#ffffff',
            padding: '1px 6px',
            borderRadius: '10px'
          }}>
            [Grounded]
          </span>
        </div>
      </div>
    </div>
  );
};

export default DocStack3D;
