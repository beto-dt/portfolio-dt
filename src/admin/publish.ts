export async function publishSite(): Promise<{ ok: boolean; actionsUrl: string }> {
  const fb = await import('./firebase-client');
  return fb.callPublish();
}
