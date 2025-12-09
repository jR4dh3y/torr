'use client';

import { useState } from 'react';
import { X, Download, Copy, Check, ArrowUp, ArrowDown, HardDrive, Calendar, Hash, Link2 } from 'lucide-react';
import { YStack, XStack, Text, Button, ScrollView, useTheme } from 'tamagui';
import type { TorrentResult } from '@/lib/types';

interface TorrentDetailModalProps {
  torrent: TorrentResult | null;
  open: boolean;
  onClose: () => void;
}

export function TorrentDetailModal({ torrent, open, onClose }: TorrentDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const theme = useTheme();

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
    <YStack
      position={"fixed" as any}
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.8)"
      zIndex={1000}
      alignItems="center"
      justifyContent="center"
      padding="$4"
      onPress={onClose}
      animation="quick"
      enterStyle={{ opacity: 0 }}
      exitStyle={{ opacity: 0 }}
    >
      <YStack
        backgroundColor="$background"
        width="100%"
        maxWidth={600}
        maxHeight="90%"
        borderRadius="$4"
        overflow="hidden"
        onPress={(e) => e.stopPropagation()}
        borderColor="$borderColor"
        borderWidth={1}
      >
        {/* Header */}
        <XStack
          padding="$4"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
          justifyContent="space-between"
          alignItems="flex-start"
          gap="$3"
        >
          <YStack flex={1} gap="$2">
            <Text fontSize="$5" fontWeight="bold" color="$color">
              {torrent.name}
            </Text>
            <Text
              fontSize="$2"
              color="$blue10"
              backgroundColor="$blue2"
              alignSelf="flex-start"
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$2"
            >
              {torrent.source}
            </Text>
          </YStack>
          <Button
            size="$3"
            circular
            icon={<X size={20} />}
            onPress={onClose}
            backgroundColor="transparent"
            hoverStyle={{ backgroundColor: '$gray4' }}
          />
        </XStack>

        <ScrollView>
          <YStack padding="$4" gap="$6">
            {/* Stats Grid */}
            <XStack flexWrap="wrap" gap="$3">
              <YStack
                flex={1}
                minWidth={100}
                backgroundColor="$gray3"
                padding="$3"
                borderRadius="$3"
                gap="$2"
              >
                <XStack gap="$2" alignItems="center">
                  <HardDrive size={14} color={theme.color.get()} />
                  <Text fontSize="$2" color="$gray10">Size</Text>
                </XStack>
                <Text fontSize="$4" fontWeight="600" color="$color">{torrent.size}</Text>
              </YStack>
              
              <YStack
                flex={1}
                minWidth={100}
                backgroundColor="$green2"
                padding="$3"
                borderRadius="$3"
                gap="$2"
              >
                <XStack gap="$2" alignItems="center">
                  <ArrowUp size={14} color="#166534" />
                  <Text fontSize="$2" color="#166534">Seeders</Text>
                </XStack>
                <Text fontSize="$4" fontWeight="600" color="#166534">{torrent.seeders.toLocaleString()}</Text>
              </YStack>

              <YStack
                flex={1}
                minWidth={100}
                backgroundColor="$red2"
                padding="$3"
                borderRadius="$3"
                gap="$2"
              >
                <XStack gap="$2" alignItems="center">
                  <ArrowDown size={14} color="#991b1b" />
                  <Text fontSize="$2" color="#991b1b">Leechers</Text>
                </XStack>
                <Text fontSize="$4" fontWeight="600" color="#991b1b">{torrent.leechers.toLocaleString()}</Text>
              </YStack>

              <YStack
                flex={1}
                minWidth={100}
                backgroundColor="$gray3"
                padding="$3"
                borderRadius="$3"
                gap="$2"
              >
                <XStack gap="$2" alignItems="center">
                  <Calendar size={14} color={theme.color.get()} />
                  <Text fontSize="$2" color="$gray10">Uploaded</Text>
                </XStack>
                <Text fontSize="$4" fontWeight="600" color="$color">{torrent.uploadDate}</Text>
              </YStack>
            </XStack>

            {/* Info Hash */}
            <YStack gap="$2">
              <XStack gap="$2" alignItems="center">
                <Hash size={14} color={theme.color.get()} />
                <Text fontSize="$3" fontWeight="600" color="$color">Info Hash</Text>
              </XStack>
              <XStack
                backgroundColor="$gray3"
                padding="$3"
                borderRadius="$3"
                justifyContent="space-between"
                alignItems="center"
                gap="$3"
              >
                <Text fontFamily="$mono" fontSize="$2" color="$gray11" numberOfLines={1} flex={1}>
                  {infoHash}
                </Text>
                <Button
                  size="$2"
                  icon={copiedField === 'hash' ? <Check size={14} /> : <Copy size={14} />}
                  onPress={() => handleCopy(infoHash, 'hash')}
                  backgroundColor={copiedField === 'hash' ? '$green9' : '$gray5'}
                  color="white"
                >
                  {copiedField === 'hash' ? 'Copied' : 'Copy'}
                </Button>
              </XStack>
            </YStack>

            {/* Magnet Link */}
            <YStack gap="$2">
              <XStack gap="$2" alignItems="center">
                <Link2 size={14} color={theme.color.get()} />
                <Text fontSize="$3" fontWeight="600" color="$color">Magnet Link</Text>
              </XStack>
              <XStack
                backgroundColor="$gray3"
                padding="$3"
                borderRadius="$3"
                justifyContent="space-between"
                alignItems="center"
                gap="$3"
              >
                <Text fontFamily="$mono" fontSize="$2" color="$gray11" numberOfLines={1} flex={1}>
                  {torrent.magnetLink}
                </Text>
                <Button
                  size="$2"
                  icon={copiedField === 'magnet' ? <Check size={14} /> : <Copy size={14} />}
                  onPress={() => handleCopy(torrent.magnetLink, 'magnet')}
                  backgroundColor={copiedField === 'magnet' ? '$green9' : '$gray5'}
                  color="white"
                >
                  {copiedField === 'magnet' ? 'Copied' : 'Copy'}
                </Button>
              </XStack>
            </YStack>

            {/* Trackers */}
            {trackers.length > 0 && (
              <YStack gap="$2">
                <Text fontSize="$3" fontWeight="600" color="$color">Trackers ({trackers.length})</Text>
                <YStack backgroundColor="$gray3" borderRadius="$3" overflow="hidden">
                  {trackers.map((tracker, i) => (
                    <YStack
                      key={i}
                      padding="$3"
                      borderBottomWidth={i < trackers.length - 1 ? 1 : 0}
                      borderBottomColor="$borderColor"
                    >
                      <Text fontSize="$2" color="$gray11" numberOfLines={1}>
                        {tracker}
                      </Text>
                    </YStack>
                  ))}
                </YStack>
              </YStack>
            )}
          </YStack>
        </ScrollView>

        {/* Footer Actions */}
        <XStack padding="$4" gap="$3" borderTopWidth={1} borderTopColor="$borderColor">
          <Button
            flex={1}
            size="$4"
            backgroundColor="$blue10"
            color="white"
            icon={<Download size={16} />}
            onPress={handleDownloadTorrent}
            hoverStyle={{ opacity: 0.9 }}
          >
            Download Torrent
          </Button>
          <Button
            flex={1}
            size="$4"
            backgroundColor="$gray5"
            color="$color"
            icon={<Copy size={16} />}
            onPress={() => handleCopy(torrent.magnetLink, 'magnet-btn')}
          >
            Copy Magnet
          </Button>
        </XStack>
      </YStack>
    </YStack>
  );
}
