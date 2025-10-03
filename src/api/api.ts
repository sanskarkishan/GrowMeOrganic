const BASE_URL = import.meta.env.VITE_API_URL;
const ROWS_PER_PAGE = 12;

export const fetchArtworks = async (page, limit = ROWS_PER_PAGE) => {
  const res = await fetch(`${BASE_URL}/artworks?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch artworks: ${res.status}`);
  return res.json();
};

export const fetchMultipleArtworks = async (startPage, count, limit = ROWS_PER_PAGE) => {
  let results = [];
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
