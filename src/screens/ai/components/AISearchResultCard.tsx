import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { AISearchSource } from '../../../models';
import { theme } from '../../../theme';

interface AISearchResultCardProps {
  sources: AISearchSource[];
  query?: string;
}

export const AISearchResultCard: React.FC<AISearchResultCardProps> = ({ sources, query }) => {
  if (!sources || sources.length === 0) return null;

  const handleOpenUrl = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('[AISearchResultCard] Error opening URL:', err));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>🔎 Web Search & Grounded Resources</Text>
      {query ? <Text style={styles.queryText}>Query: "{query}"</Text> : null}

      <ScrollView style={styles.scrollList} nestedScrollEnabled>
        {sources.map((src, index) => {
          const isYouTube = src.domain.includes('youtube') || src.domain.includes('youtu.be');
          return (
            <TouchableOpacity
              key={`search-src-${index}`}
              style={styles.card}
              onPress={() => handleOpenUrl(src.url)}
              activeOpacity={0.7}
            >
              <View style={styles.badgeRow}>
                <Text style={[styles.domainBadge, isYouTube && styles.ytBadge]}>
                  {isYouTube ? '▶ YouTube' : `🌐 ${src.domain}`}
                </Text>
              </View>

              <Text style={styles.titleText}>{src.title}</Text>
              {src.snippet ? <Text style={styles.snippetText} numberOfLines={2}>{src.snippet}</Text> : null}

              <Text style={styles.urlText} numberOfLines={1}>{src.url}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  queryText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontStyle: 'italic',
  },
  scrollList: {
    maxHeight: 220,
  },
  card: {
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.spacing.borderRadius.sm,
    padding: theme.spacing.xs + 2,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  domainBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ytBadge: {
    color: '#FF0000',
    backgroundColor: '#FFE6E6',
  },
  titleText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  snippetText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  urlText: {
    fontSize: 10,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
});
