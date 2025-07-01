import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/contexts/data-context';
import { useToast } from '@/hooks/use-toast';
import { useHasPermission } from './use-has-permission';

export function useRequireAuth(featureName: string): boolean {
  const { currentUser, permissions } = useData();
  const router = useRouter();
  const { toast } = useToast();
  const hasPermission = useHasPermission(featureName);
  
  // Start assuming not authorized until checks pass
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Wait until user and permissions are loaded to prevent flicker/redirects
    if (!currentUser || permissions.length === 0) {
      return;
    }

    if (hasPermission) {
      setIsAuthorized(true);
    } else {
      // Only show toast and redirect once
      if (!isAuthorized) {
          toast({
            variant: "destructive",
            title: "Acesso Negado",
            description: "Você não tem permissão para acessar esta página.",
          });
          router.push('/');
      }
    }
  }, [currentUser, permissions, hasPermission, router, toast, featureName, isAuthorized]);

  // Return true only if all checks passed
  return isAuthorized;
}
