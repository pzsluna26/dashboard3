'use client';

import { useDataLoader } from '@/shared/hooks/useDataLoader';

export default function TestDataLoader() {
  const { data, loading, error } = useDataLoader();

  console.log('TestDataLoader render:', { 
    hasData: !!data, 
    loading, 
    hasError: !!error,
    errorMessage: error?.message 
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>No data</div>;
  }

  return (
    <div>
      <h2>Data Loaded Successfully!</h2>
      <p>Incidents: {data.incidents.length}</p>
      <p>Legal Articles: {data.legalArticles.length}</p>
      <p>Comments: {data.comments.length}</p>
      <p>News: {data.news.length}</p>
    </div>
  );
}