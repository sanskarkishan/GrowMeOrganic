const BASE_URL = import.meta.env.VITE_API_URL as string;
const ROWS_PER_PAGE = 12;

// ✅ Define Artwork type
export type Artwork = {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: number;
  date_end: number;
};

// ✅ Response from single page fetch
interface ArtworkResponse {
  data: Artwork[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    [key: string]: any;
  };
}

/**
 * Fetch a single page of artworks
 */
export const fetchArtworks = async (
  page: number,
  limit: number = ROWS_PER_PAGE
): Promise<ArtworkResponse> => {
  const res = await fetch(`${BASE_URL}/artworks?page=${page}&limit=${limit}`);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch artworks: ${res.status} - ${errorText}`);
  }
  return res.json();
};

/**
 * Fetch multiple artworks across pages
 */
export const fetchMultipleArtworks = async (
  startPage: number,
  count: number,
  limit: number = ROWS_PER_PAGE
): Promise<Artwork[]> => {
  let results: Artwork[] = [];
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