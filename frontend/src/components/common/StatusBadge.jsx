import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, Wifi, WifiOff } from 'lucide-react';

export const StatusBadge = ({ type = 'ready', label, className = '' }) => {
  const getBadgeStyle = () => {
    switch (type) {
      case 'connected':
        return {
          bg: 'rgba(16, 185, 129, 0.1)',
          color: '#34d399',
          border: 'rgba(16, 185, 129, 0.2)',
          icon: <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'offline':
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          color: '#f87171',
          border: 'rgba(239, 68, 68, 0.2)',
          icon: <WifiOff className="w-3.5 h-3.5 text-rose-400" />
        };
      case 'loading':
      case 'indexing':
        return {
          bg: 'rgba(59, 130, 246, 0.1)',
          color: '#60a5fa',
          border: 'rgba(59, 130, 246, 0.2)',
          icon: <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
        };
      case 'error':
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          color: '#f87171',
          border: 'rgba(239, 68, 68, 0.2)',
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        };
      case 'ready':
      default:
        return {
          bg: 'rgba(16, 185, 129, 0.1)',
          color: '#34d399',
          border: 'rgba(16, 185, 129, 0.25)',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <span
      className={`badge ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
      }}
    >
      {style.icon}
      <span>{label || (type === 'ready' ? 'Ready' : type)}</span>
    </span>
  );
};
