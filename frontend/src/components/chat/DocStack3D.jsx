import React from 'react';
import { FileText, Sparkles, Database, Check, Layers } from 'lucide-react';

export const DocStack3D = () => {
  return (
    <div style={{
      position: 'relative',
      width: '320px',
      height: '180px',
      margin: '0 auto 28px auto',
      perspective: '1200px'
    }}>
      {/* Background Soft Glow Aura */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '240px',
        height: '120px',
        background: 'radial-gradient(ellipse, rgba(37, 99, 235, 0.15) 0%, rgba(99, 102, 241, 0.08) 50%, transparent 80%)',
        filter: 'blur(20px)',
        pointerEvents: 'none'
      }} />

      {/* Layer 1: Back Vector Sheet (Tilted & Receded) */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%) rotate(-6deg) translateZ(-40px)',
        width: '220px',
        height: '130px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.06)',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        opacity: 0.75
      }}>
        <div style={{ width: '40%', height: '8px', borderRadius: '4px', backgroundColor: '#e2e8f0' }} />
        <div style={{ width: '85%', height: '6px', borderRadius: '3px', backgroundColor: '#f1f5f9' }} />
        <div style={{ width: '70%', height: '6px', borderRadius: '3px', backgroundColor: '#f1f5f9' }} />
        <div style={{ width: '90%', height: '6px', borderRadius: '3px', backgroundColor: '#f1f5f9' }} />
      </div>

      {/* Layer 2: Middle Semantic Retrieval Layer */}
      <div style={{
        position: 'absolute',
        top: '6px',
        left: '50%',
        transform: 'translateX(-50%) rotate(4deg) translateZ(-20px)',
        width: '240px',
        height: '140px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '18px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 14px 30px -6px rgba(15, 23, 42, 0.08)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        opacity: 0.9
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: '35%', height: '8px', borderRadius: '4px', backgroundColor: '#cbd5e1' }} />
          <span style={{
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            color: '#6366f1'
          }}>
            VECTOR TOP-K
          </span>
        </div>
        <div style={{ width: '90%', height: '6px', borderRadius: '3px', backgroundColor: '#f1f5f9' }} />
        <div style={{ width: '75%', height: '6px', borderRadius: '3px', backgroundColor: '#f1f5f9' }} />
      </div>

      {/* Layer 3: Front Primary Floating Document Card */}
      <div className="animate-float" style={{
        position: 'absolute',
        top: '0',
        left: '50%',
        transform: 'translateX(-50%) translateZ(20px)',
        width: '260px',
        height: '145px',
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #bfdbfe',
        boxShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.15), 0 0 1px 1px rgba(191, 219, 254, 0.8)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)'
              }}>
                <FileText style={{ width: '15px', height: '15px' }} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                  Knowledge Base
                </div>
                <div style={{ fontSize: '10px', color: '#64748b' }}>
                  63 chunks indexed
                </div>
              </div>
            </div>

            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '10px',
              fontWeight: 600,
              color: '#059669',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              padding: '2px 6px',
              borderRadius: '6px'
            }}>
              <Check style={{ width: '10px', height: '10px' }} />
              Ready
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ width: '100%', height: '5px', borderRadius: '3px', backgroundColor: '#eff6ff' }} />
            <div style={{ width: '80%', height: '5px', borderRadius: '3px', backgroundColor: '#eff6ff' }} />
          </div>
        </div>

        {/* Floating Citation Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: '#2563eb', fontWeight: 600 }}>
            <Sparkles style={{ width: '12px', height: '12px' }} />
            <span>Augmented Retrieval</span>
          </div>

          <span style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 100%)',
            color: '#ffffff',
            padding: '2px 8px',
            borderRadius: '12px',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
          }}>
            [Evidence #1]
          </span>
        </div>
      </div>
    </div>
  );
};
