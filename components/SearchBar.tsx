'use client';

import { useState } from 'react';
import { Input, Button, XStack, Spinner } from 'tamagui';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <XStack gap="$3" alignItems="center" width="100%">
        <Input
          flex={1}
          size="$4"
          placeholder="Search for torrents..."
          value={query}
          onChangeText={setQuery}
          backgroundColor="$background"
          borderColor="$borderColor"
          borderWidth={1}
          borderRadius="$4"
          paddingHorizontal="$4"
          disabled={isLoading}
        />
        <Button
          size="$4"
          backgroundColor="$blue10"
          color="white"
          borderRadius="$4"
          pressStyle={{ opacity: 0.8 }}
          disabled={isLoading || !query.trim()}
          onPress={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
          icon={isLoading ? <Spinner size="small" color="white" /> : <Search size={20} />}
        >
          Search
        </Button>
      </XStack>
    </form>
  );
}
