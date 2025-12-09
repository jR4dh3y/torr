'use client';

import { Download, Magnet, ArrowUp, ArrowDown, HardDrive, Calendar, ChevronRight } from 'lucide-react';
import type { TorrentResult } from '@/lib/types';

interface TorrentCardProps {
  torrent: TorrentResult;
  onPress?: () => void;
}

export function TorrentCard({ torrent, onPress }: TorrentCardProps) {
  const handleMagnetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = torrent.magnetLink;
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (torrent.torrentUrl) {
      window.open(torrent.torrentUrl, '_blank');
    } else {
      window.location.href = torrent.magnetLink;
    }
  };

  return (
    <div className="torrent-card" onClick={onPress}>
      {/* Title and Source */}
      <div className="card-header">
        <h3 className="torrent-name">{torrent.name}</h3>
        <span className="source-badge">{torrent.source}</span>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat">
          <HardDrive size={14} />
          <span>{torrent.size}</span>
        </div>
        <div className="stat seeders">
          <ArrowUp size={14} />
          <span>{torrent.seeders.toLocaleString()}</span>
        </div>
        <div className="stat leechers">
          <ArrowDown size={14} />
          <span>{torrent.leechers.toLocaleString()}</span>
        </div>
        <div className="stat">
          <Calendar size={14} />
          <span>{torrent.uploadDate}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="actions-row">
        <button className="action-btn download" onClick={handleDownloadClick}>
          <Download size={14} />
          <span>Download</span>
        </button>
        <button className="action-btn magnet" onClick={handleMagnetClick}>
          <Magnet size={14} />
          <span>Magnet</span>
        </button>
        <ChevronRight size={18} className="chevron" />
      </div>

      <style jsx>{`
        .torrent-card {
          background: var(--background, #1a1a1a);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .torrent-card:hover {
          border-color: #3b82f6;
          transform: translateY(-1px);
        }

        .torrent-card:active {
          transform: scale(0.99);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .torrent-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--color, white);
          margin: 0;
          line-height: 1.4;
          flex: 1;
          word-break: break-word;
        }

        .source-badge {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          flex-shrink: 0;
        }

        .stats-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 12px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        .stat.seeders {
          color: #22c55e;
          font-weight: 600;
        }

        .stat.leechers {
          color: #ef4444;
        }

        .actions-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: white;
          flex: 1;
          justify-content: center;
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

        .chevron {
          color: rgba(255, 255, 255, 0.3);
          margin-left: auto;
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .stats-row {
            gap: 12px;
          }
          
          .action-btn span {
            display: none;
          }
          
          .action-btn {
            flex: 0;
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
}
