'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BusinessOpportunityListPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/workspace/business-opportunity/group');
  }, [router]);
  return null;
}
