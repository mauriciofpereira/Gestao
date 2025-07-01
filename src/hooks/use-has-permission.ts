import { useMemo } from 'react';
import { useData } from '@/contexts/data-context';

export function useHasPermission(featureName: string): boolean {
  const { currentUser, permissions } = useData();

  const hasAccess = useMemo(() => {
    if (!currentUser || !permissions.length) return false;
    const permission = permissions.find(p => p.feature === featureName);
    return !!(permission && permission[currentUser.role]);
  }, [currentUser, permissions, featureName]);

  return hasAccess;
}
