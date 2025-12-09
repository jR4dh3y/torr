'use client';

import { useState } from 'react';
import { YStack, Text, Spinner } from 'tamagui';
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
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$8" gap="$4">
        <Spinner size="large" color="$blue10" />
        <Text color="$gray10">Searching torrents...</Text>
      </YStack>
    );
  }

  if (!hasSearched) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$8">
        <Text color="$gray10" fontSize="$4">Enter a search term to find torrents</Text>
      </YStack>
    );
  }

  if (results.length === 0) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" padding="$8">
        <Text color="$gray10" fontSize="$4">No torrents found. Try a different search term.</Text>
      </YStack>
    );
  }

  return (
    <>
      <YStack gap="$4" paddingBottom="$4">
        <Text color="$gray10" fontSize="$3">Found {results.length} results</Text>
        <YStack gap="$3">
          {results.map((torrent) => (
            <TorrentCard 
              key={torrent.id} 
              torrent={torrent} 
              onPress={() => handleTorrentClick(torrent)}
            />
          ))}
        </YStack>
      </YStack>

      <TorrentDetailModal
        torrent={selectedTorrent}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
