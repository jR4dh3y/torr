'use client';

import { useState } from 'react';
import { X, Download, Copy, Check, ArrowUp, ArrowDown, HardDrive, Calendar, Hash, Link2 } from 'lucide-react';
import type { TorrentResult } from '@/lib/types';

interface TorrentDetailModalProps {
  torrent: TorrentResult | null;
  open: boolean;
  onClose: () => void;
}

export function TorrentDetailModal({ torrent, open, onClose }: TorrentDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!torrent || !open) return null;

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleMagnetClick = () => {
    window.location.href = torrent.magnetLink;
  };

  const handleDownloadTorrent = () => {
    if (torrent.torrentUrl) {
      window.open(torrent.torrentUrl, '_blank');
    } else {
      window.location.href = torrent.magnetLink;
    }
  };

  // Extract info hash from magnet link
  const infoHashMatch = torrent.magnetLink.match(/btih:([a-fA-F0-9]+)/i);
  const infoHash = infoHashMatch ? infoHashMatch[1].toUpperCase() : 'Unknown';

  // Extract trackers from magnet link
  const trackers = torrent.magnetLink
    .split('&tr=')
    .slice(1)
    .map(t => decodeURIComponent(t.split('&')[0]));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">{torrent.name}</h2>
            <span className="source-badge">{torrent.source}</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">
              <HardDrive size={14} />
              <span>Size</span>
            </div>
            <div className="stat-value">{torrent.size}</div>
          </div>
          <div className="stat-card stat-green">
            <div className="stat-label">
              <ArrowUp size={14} />
              <span>Seeders</span>
            </div>
            <div className="stat-value green">{torrent.seeders.toLocaleString()}</div>
          </div>
          <div className="stat-card stat-red">
            <div className="stat-label">
              <ArrowDown size={14} />
              <span>Leechers</span>
            </div>
            <div className="stat-value red">{torrent.leechers.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">
              <Calendar size={14} />
              <span>Uploaded</span>
            </div>
            <div className="stat-value">{torrent.uploadDate}</div>
          </div>
        </div>

        {/* Info Hash */}
        <div className="info-section">
          <div className="info-label">
            <Hash size={14} />
            <span>Info Hash</span>
          </div>
          <div className="info-row">
            <code className="info-value">{infoHash}</code>
            <button 
              className={`copy-btn ${copiedField === 'hash' ? 'copied' : ''}`}
              onClick={() => handleCopy(infoHash, 'hash')}
            >
              {copiedField === 'hash' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Magnet Link */}
        <div className="info-section">
          <div className="info-label">
            <Link2 size={14} />
            <span>Magnet Link</span>
          </div>
          <div className="info-row">
            <code className="info-value truncate">{torrent.magnetLink.substring(0, 60)}...</code>
            <button 
              className={`copy-btn ${copiedField === 'magnet' ? 'copied' : ''}`}
              onClick={() => handleCopy(torrent.magnetLink, 'magnet')}
            >
              {copiedField === 'magnet' ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Trackers */}
        {trackers.length > 0 && (
          <div className="info-section">
            <div className="info-label">
              <span>Trackers ({trackers.length})</span>
            </div>
            <div className="trackers-list">
              {trackers.slice(0, 5).map((tracker, index) => (
                <code key={index} className="tracker-item">{tracker}</code>
              ))}
              {trackers.length > 5 && (
                <span className="more-trackers">+{trackers.length - 5} more</span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-btn download" onClick={handleDownloadTorrent}>
            <Download size={18} />
            <span>{torrent.torrentUrl ? 'Download .torrent' : 'Download'}</span>
          </button>
          <button className="action-btn magnet" onClick={handleMagnetClick}>
            <Download size={18} />
            <span>Open Magnet</span>
          </button>
          <button 
            className={`action-btn copy ${copiedField === 'magnet-full' ? 'copied' : ''}`}
            onClick={() => handleCopy(torrent.magnetLink, 'magnet-full')}
          >
            {copiedField === 'magnet-full' ? <Check size={18} /> : <Copy size={18} />}
            <span>{copiedField === 'magnet-full' ? 'Copied!' : 'Copy Magnet'}</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: var(--background, #1a1a1a);
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
        }

        .modal-title-section {
          flex: 1;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--color, white);
          margin: 0 0 8px 0;
          line-height: 1.4;
          word-break: break-word;
        }

        .source-badge {
          display: inline-block;
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          color: var(--color, white);
          transition: background 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 12px;
          border-radius: 10px;
        }

        .stat-card.stat-green {
          background: rgba(34, 197, 94, 0.1);
        }

        .stat-card.stat-red {
          background: rgba(239, 68, 68, 0.1);
        }

        .stat-label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 600;
          color: var(--color, white);
        }

        .stat-value.green {
          color: #22c55e;
        }

        .stat-value.red {
          color: #ef4444;
        }

        .info-section {
          margin-bottom: 16px;
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 13px;
          margin-bottom: 8px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          padding: 10px 12px;
          border-radius: 8px;
        }

        .info-value {
          flex: 1;
          font-family: monospace;
          font-size: 12px;
          color: var(--color, white);
          word-break: break-all;
        }

        .info-value.truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .copy-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 6px;
          padding: 6px;
          cursor: pointer;
          color: var(--color, white);
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .copy-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .copy-btn.copied {
          background: #22c55e;
        }

        .trackers-list {
          background: rgba(255, 255, 255, 0.05);
          padding: 10px 12px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tracker-item {
          font-family: monospace;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          word-break: break-all;
        }

        .more-trackers {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 4px;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 20px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
        }

        .action-btn.download {
          background: #22c55e;
        }

        .action-btn.download:hover {
          background: #16a34a;
        }

        .action-btn.magnet {
          background: #a855f7;
        }

        .action-btn.magnet:hover {
          background: #9333ea;
        }

        .action-btn.copy {
          background: #3b82f6;
        }

        .action-btn.copy:hover {
          background: #2563eb;
        }

        .action-btn.copy.copied {
          background: #22c55e;
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }
          
          .modal-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
