export type Analytics = {
  total: number;
  byDay: Record<string, number>;
  bySection: Record<string, number>;
};

export async function loadAnalytics(): Promise<Analytics> {
  const fb = await import('./firebase-client');
  const data = await fb.readAnalyticsDoc();
  return {
    total: typeof data?.total === 'number' ? data.total : 0,
    byDay: (data?.byDay as Record<string, number>) ?? {},
    bySection: (data?.bySection as Record<string, number>) ?? {},
  };
}
