const BASE_URL = import.meta.env.VITE_API_URL as string;
const ROWS_PER_PAGE = 12;

// local only, not exported
interface ArtworkResponse {
  data: any[];
  pagination: {
    total: number;
    [key: string]: any;
  };
}

export const fetchArtworks = async (
  page: number,
  limit: number = ROWS_PER_PAGE
): Promise<ArtworkResponse> => {
  const res = await fetch(`${BASE_URL}/artworks?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch artworks: ${res.status}`);
  return res.json();
};

export const fetchMultipleArtworks = async (
  startPage: number,
  count: number,
  limit: number = ROWS_PER_PAGE
): Promise<any[]> => {
  let results: any[] = [];
  let page = startPage;

  while (results.length < count) {
    const res = await fetchArtworks(page, limit);

    if (!res.data || res.data.length === 0) break;

    const remaining = count - results.length;
    results = [...results, ...res.data.slice(0, remaining)];
    page++;
  }

  return results;
};
