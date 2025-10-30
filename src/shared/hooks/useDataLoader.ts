/**
 * 데이터 로딩 훅
 * JSON 파일 로딩 및 에러 처리를 담당
 * 요구사항 11.1, 11.2, 11.3, 11.4 지원
 */

import { useState, useEffect, useCallback } from 'react';
import { ProcessedData, DataLoadingError, DataLoadingState } from '@/shared/types/dashboard';
import { DataProcessor } from '@/shared/services/dataProcessor';

interface UseDataLoaderOptions {
  autoLoad?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

interface UseDataLoaderReturn extends DataLoadingState {
  reload: () => Promise<void>;
  clearError: () => void;
}

/**
 * 데이터 로딩 훅
 * JSON 파일들을 로드하고 DataProcessor를 통해 처리된 데이터를 반환
 */
export function useDataLoader(options: UseDataLoaderOptions = {}): UseDataLoaderReturn {
  const {
    autoLoad = true,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  const [state, setState] = useState<DataLoadingState>({
    loading: false,
    error: null,
    data: null
  });

  /**
   * 단일 JSON 파일 로드
   */
  const loadJsonFile = async (url: string): Promise<any> => {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`Expected JSON but got ${contentType} for ${url}`);
    }
    
    return await response.json();
  };

  /**
   * 재시도 로직이 포함된 파일 로드
   */
  const loadWithRetry = async (url: string, attempts: number = retryAttempts): Promise<any> => {
    for (let i = 0; i < attempts; i++) {
      try {
        return await loadJsonFile(url);
      } catch (error) {
        const isLastAttempt = i === attempts - 1;
        
        if (isLastAttempt) {
          throw error;
        }
        
        // 재시도 전 대기
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
        console.warn(`Retry attempt ${i + 1} for ${url}`);
      }
    }
  };

  /**
   * 모든 데이터 파일 로드 및 처리
   */
  const loadData = useCallback(async (): Promise<void> => {
    console.log('useDataLoader: Starting data load...');
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // 병렬로 JSON 파일들 로드
      console.log('useDataLoader: Loading JSON files...');
      const [newsData, socialData] = await Promise.all([
        loadWithRetry('/data/news.json'),
        loadWithRetry('/data/social.json')
      ]);

      console.log('useDataLoader: JSON files loaded', {
        newsDataKeys: Object.keys(newsData || {}),
        socialDataKeys: Object.keys(socialData || {})
      });

      // 데이터 유효성 검증
      if (!newsData || typeof newsData !== 'object') {
        throw new Error('뉴스 데이터가 유효하지 않습니다.');
      }

      if (!socialData || typeof socialData !== 'object') {
        throw new Error('소셜 데이터가 유효하지 않습니다.');
      }

      // DataProcessor를 통해 데이터 처리
      const processedData = DataProcessor.processRawData(newsData, socialData);

      // 처리된 데이터 유효성 검증
      if (!processedData.incidents || !processedData.legalArticles || 
          !processedData.comments || !processedData.news) {
        throw new Error('데이터 처리 중 오류가 발생했습니다.');
      }

      setState({
        loading: false,
        error: null,
        data: processedData
      });

      console.log('Data loaded successfully:', {
        incidents: processedData.incidents.length,
        legalArticles: processedData.legalArticles.length,
        comments: processedData.comments.length,
        news: processedData.news.length
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      
      const dataError: DataLoadingError = {
        message: errorMessage,
        code: error instanceof Error && 'code' in error ? String(error.code) : undefined,
        timestamp: new Date()
      };

      setState({
        loading: false,
        error: dataError,
        data: null
      });

      console.error('Data loading failed:', error);
    }
  }, [retryAttempts, retryDelay]);

  /**
   * 에러 상태 초기화
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * 데이터 재로드
   */
  const reload = useCallback(async (): Promise<void> => {
    await loadData();
  }, [loadData]);

  // 컴포넌트 마운트 시 자동 로드
  useEffect(() => {
    if (autoLoad) {
      loadData();
    }
  }, [autoLoad, loadData]);

  return {
    ...state,
    reload,
    clearError
  };
}

/**
 * 특정 JSON 파일만 로드하는 훅
 */
export function useJsonLoader<T = any>(url: string, options: UseDataLoaderOptions = {}) {
  const [state, setState] = useState<{
    loading: boolean;
    error: DataLoadingError | null;
    data: T | null;
  }>({
    loading: false,
    error: null,
    data: null
  });

  const {
    autoLoad = true,
    retryAttempts = 3,
    retryDelay = 1000
  } = options;

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let data: T;
      
      // 재시도 로직
      for (let i = 0; i < retryAttempts; i++) {
        try {
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          data = await response.json();
          break;
        } catch (error) {
          if (i === retryAttempts - 1) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1)));
        }
      }

      setState({
        loading: false,
        error: null,
        data: data!
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '파일 로드에 실패했습니다.';
      
      setState({
        loading: false,
        error: {
          message: errorMessage,
          timestamp: new Date()
        },
        data: null
      });
    }
  }, [url, retryAttempts, retryDelay]);

  const reload = useCallback(() => loadData(), [loadData]);
  
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    if (autoLoad && url) {
      loadData();
    }
  }, [autoLoad, url, loadData]);

  return {
    ...state,
    reload,
    clearError
  };
}

/**
 * 데이터 로딩 상태를 위한 유틸리티 함수들
 */
export const dataLoaderUtils = {
  /**
   * 로딩 상태인지 확인
   */
  isLoading: (state: DataLoadingState): boolean => state.loading,

  /**
   * 에러 상태인지 확인
   */
  hasError: (state: DataLoadingState): boolean => state.error !== null,

  /**
   * 데이터가 로드되었는지 확인
   */
  hasData: (state: DataLoadingState): boolean => state.data !== null,

  /**
   * 로딩이 완료되었는지 확인 (성공 또는 실패)
   */
  isComplete: (state: DataLoadingState): boolean => !state.loading,

  /**
   * 에러 메시지 가져오기
   */
  getErrorMessage: (state: DataLoadingState): string => {
    return state.error?.message || '';
  },

  /**
   * 데이터 통계 정보 가져오기
   */
  getDataStats: (data: ProcessedData | null) => {
    if (!data) return null;
    
    return {
      totalIncidents: data.incidents.length,
      totalLegalArticles: data.legalArticles.length,
      totalComments: data.comments.length,
      totalNews: data.news.length,
      mappingRate: Object.keys(data.mappings.incidentToLegal).length / data.incidents.length * 100
    };
  }
};