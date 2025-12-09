'use client';

import { Download, Magnet, ArrowUp, ArrowDown, HardDrive, Calendar, ChevronRight } from 'lucide-react';
import { YStack, XStack, Text, Button, useTheme } from 'tamagui';
import type { TorrentResult } from '@/lib/types';

interface TorrentCardProps {
  torrent: TorrentResult;
  onPress?: () => void;
}

export function TorrentCard({ torrent, onPress }: TorrentCardProps) {
  const theme = useTheme();
  
  const handleMagnetClick = (e: any) => {
    e?.stopPropagation?.();
    window.location.href = torrent.magnetLink;
  };

  const handleDownloadClick = (e: any) => {
    e?.stopPropagation?.();
    if (torrent.torrentUrl) {
      window.open(torrent.torrentUrl, '_blank');
    } else {
      window.location.href = torrent.magnetLink;
    }
  };

  return (
    <YStack
      backgroundColor="$background"
      borderColor="$borderColor"
      borderWidth={1}
      borderRadius="$4"
      padding="$4"
      cursor="pointer"
      hoverStyle={{
        borderColor: '$blue10',
        y: -1,
      }}
      pressStyle={{
        scale: 0.99,
      }}
      onPress={onPress}
      animation="quick"
    >
      {/* Title and Source */}
      <XStack justifyContent="space-between" alignItems="flex-start" gap="$3" marginBottom="$3">
        <Text
          fontSize="$4"
          fontWeight="600"
          color="$color"
          lineHeight="$4"
          flex={1}
        >
          {torrent.name}
        </Text>
        <Text
          fontSize="$2"
          color="$blue10"
          backgroundColor="$blue2"
          paddingHorizontal="$2"
          paddingVertical="$1"
          borderRadius="$2"
          overflow="hidden"
        >
          {torrent.source}
        </Text>
      </XStack>

      {/* Stats Row */}
      <XStack gap="$4" flexWrap="wrap" marginBottom="$4">
        <XStack gap="$2" alignItems="center">
          <HardDrive size={14} color={theme.color.get()} />
          <Text fontSize="$3" color="$color">{torrent.size}</Text>
        </XStack>
        <XStack gap="$2" alignItems="center">
          <ArrowUp size={14} color="#22c55e" />
          <Text fontSize="$3" color="#22c55e">{torrent.seeders.toLocaleString()}</Text>
        </XStack>
        <XStack gap="$2" alignItems="center">
          <ArrowDown size={14} color="#ef4444" />
          <Text fontSize="$3" color="#ef4444">{torrent.leechers.toLocaleString()}</Text>
        </XStack>
        <XStack gap="$2" alignItems="center">
          <Calendar size={14} color={theme.color.get()} />
          <Text fontSize="$3" color="$color">{torrent.uploadDate}</Text>
        </XStack>
      </XStack>

      {/* Action Buttons */}
      <XStack gap="$2" alignItems="center">
        <Button
          size="$3"
          backgroundColor="$blue10"
          color="white"
          icon={<Download size={14} color="white" />}
          onPress={handleDownloadClick}
          hoverStyle={{ opacity: 0.9 }}
        >
          Download
        </Button>
        <Button
          size="$3"
          backgroundColor="$gray5"
          color="$color"
          icon={<Magnet size={14} color={theme.color.get()} />}
          onPress={handleMagnetClick}
          hoverStyle={{ backgroundColor: '$gray6' }}
        >
          Magnet
        </Button>
        <YStack flex={1} />
        <ChevronRight size={18} color={theme.color.get()} style={{ opacity: 0.5 }} />
      </XStack>
    </YStack>
  );
}
