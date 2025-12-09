'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { TorrentCard } from './TorrentCard';
import { TorrentDetailModal } from './TorrentDetailModal';
import type { TorrentResult } from '@/lib/types';

interface TorrentListProps {
  results: TorrentResult[];
  isLoading: boolean;
  hasSearched: boolean;
}

export function TorrentList({ results, isLoading, hasSearched }: TorrentListProps) {
  const [selectedTorrent, setSelectedTorrent] = useState<TorrentResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTorrentClick = (torrent: TorrentResult) => {
    setSelectedTorrent(torrent);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTorrent(null);
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <Loader2 size={32} className="spinner" />
        <p>Searching torrents...</p>
        <style jsx>{`
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 48px;
            gap: 16px;
            color: rgba(255, 255, 255, 0.6);
          }
          .empty-state :global(.spinner) {
            animation: spin 1s linear infinite;
            color: #3b82f6;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="empty-state">
        <p>Enter a search term to find torrents</p>
        <style jsx>{`
          .empty-state {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 48px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 16px;
          }
        `}</style>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="empty-state">
        <p>No torrents found. Try a different search term.</p>
        <style jsx>{`
          .empty-state {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 48px;
            color: rgba(255, 255, 255, 0.6);
            font-size: 16px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="results-container">
        <p className="results-count">Found {results.length} results</p>
        <div className="results-list">
          {results.map((torrent) => (
            <TorrentCard 
              key={torrent.id} 
              torrent={torrent} 
              onPress={() => handleTorrentClick(torrent)}
            />
          ))}
        </div>
      </div>

      <TorrentDetailModal
        torrent={selectedTorrent}
        open={isModalOpen}
        onClose={handleCloseModal}
      />

      <style jsx>{`
        .results-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .results-count {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          margin: 0;
        }
        .results-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
      `}</style>
    </>
  );
}
