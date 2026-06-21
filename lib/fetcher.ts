export const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const error = new Error('Fetch failed') as Error & { status: number };
    error.status = res.status;
    throw error;
  }
  return res.json();
};
