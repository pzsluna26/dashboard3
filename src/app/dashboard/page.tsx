import { Suspense } from 'react';
import DashboardLayout from './components/DashboardLayout';
import LoadingSpinner from '@/shared/components/LoadingSpinner';

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardLayout />
    </Suspense>
  );
}