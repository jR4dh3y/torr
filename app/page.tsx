'use client';

import { useState } from 'react';
import { YStack, Text, XStack, useTheme } from 'tamagui';
import { Zap } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { TorrentList } from '@/components/TorrentList';
import type { TorrentResult } from '@/lib/types';

export default function Home() {
  const [results, setResults] = useState<TorrentResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const theme = useTheme();

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <YStack
      flex={1}
      style={{ minHeight: '100vh' }}
      background="$background"
      p="$4"
    >
      <YStack
        style={{ maxWidth: 900 }}
        width="100%"
        mx="auto"
        gap="$6"
        py="$6"
      >
        {/* Header */}
        <YStack alignItems="center" gap="$2" marginBottom="$4">
          <XStack alignItems="center" gap="$3">
            <Zap size={40} color={theme.blue10.get()} />
            <Text
              fontSize="$10"
              fontWeight="bold"
              color="$color"
            >
              Torr
            </Text>
          </XStack>
          <Text color="$gray11" fontSize="$4" textAlign="center">
            Fast & Private Torrent Search Engine
          </Text>
          <Text color="$gray10" fontSize="$2" textAlign="center">
            Using DNS-over-HTTPS to bypass ISP blocking
          </Text>
        </YStack>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />

        {/* Results */}
        <TorrentList
          results={results}
          isLoading={isLoading}
          hasSearched={hasSearched}
        />
      </YStack>
    </YStack>
  );
}
