import { useMemo } from 'react';
import { ProcessedData, DataCollectionStatus } from '@/shared/types/dashboard';

export const useDataCollectionStatus = (data: ProcessedData | null): DataCollectionStatus | null => {
  return useMemo(() => {
    if (!data) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate today's data
    const todayNews = data.news.filter(news => {
      const publishedDate = new Date(news.publishedAt);
      return publishedDate >= today;
    }).length;

    const todayComments = data.comments.filter(comment => {
      const createdDate = new Date(comment.createdAt);
      return createdDate >= today;
    }).length;

    // Calculate mapping success rate
    const totalMappableItems = data.news.length + data.comments.length;
    const successfullyMappedItems = data.news.filter(news => 
      news.incidentId && news.legalArticleId
    ).length + data.comments.filter(comment => 
      comment.incidentId && comment.legalArticleId
    ).length;
    
    const mappingSuccessRate = totalMappableItems > 0 
      ? (successfullyMappedItems / totalMappableItems) * 100 
      : 0;

    // Calculate source distribution with all possible sources
    const allSources = ['naver', 'youtube', 'twitter', 'blog'] as const;
    const sourceCount: Record<string, number> = {};
    
    // Initialize all sources with 0
    allSources.forEach(source => {
      sourceCount[source] = 0;
    });
    
    // Count actual comments by source
    data.comments.forEach(comment => {
      sourceCount[comment.source] = (sourceCount[comment.source] || 0) + 1;
    });

    const totalComments = data.comments.length;
    const sourceDistribution = Object.entries(sourceCount)
      .map(([source, count]) => ({
        source,
        count,
        percentage: totalComments > 0 ? (count / totalComments) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalNews: data.news.length,
      totalComments: data.comments.length,
      todayNews,
      todayComments,
      mappingSuccessRate: Math.round(mappingSuccessRate * 10) / 10, // Round to 1 decimal
      lastUpdateTime: new Date().toISOString(),
      sourceDistribution
    };
  }, [data]);
};