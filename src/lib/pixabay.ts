try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('server-only');
} catch {
  // Ignore in Node.js script execution context
}

export interface PixabayImageResult {
  id: string;
  url: string;
  thumbnailUrl: string;
  sourceUrl: string;
  photographer: string;
  photographerUrl?: string;
  width: number;
  height: number;
  tags: string;
  alt: string;
  source: 'Pixabay';
}

export interface PixabaySearchOptions {
  page?: number;
  perPage?: number;
  orientation?: 'all' | 'horizontal' | 'vertical';
  category?: string;
  imageType?: 'all' | 'photo' | 'illustration' | 'vector';
  minWidth?: number;
  minHeight?: number;
}

export async function searchPixabayImages(
  query: string,
  options: PixabaySearchOptions = {}
): Promise<{ success: boolean; images: PixabayImageResult[]; totalHits: number; message?: string }> {
  const apiKey = process.env.PIXABAY_API_KEY;

  if (!apiKey) {
    console.warn('PIXABAY_API_KEY is not configured in .env.local');
    return {
      success: false,
      images: [],
      totalHits: 0,
      message: 'PIXABAY_API_KEY is missing. Add PIXABAY_API_KEY to .env.local.',
    };
  }

  const {
    page = 1,
    perPage = 20,
    orientation = 'horizontal',
    imageType = 'photo',
    minWidth = 640,
    minHeight = 480,
    category,
  } = options;

  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { success: true, images: [], totalHits: 0 };
  }

  try {
    const params = new URLSearchParams({
      key: apiKey,
      q: cleanQuery,
      image_type: imageType,
      orientation: orientation,
      per_page: Math.min(perPage, 100).toString(),
      page: page.toString(),
      min_width: minWidth.toString(),
      min_height: minHeight.toString(),
      safesearch: 'true',
    });

    if (category) {
      params.append('category', category);
    }

    const apiUrl = `https://pixabay.com/api/?${params.toString()}`;
    const res = await fetch(apiUrl, { next: { revalidate: 3600 } });

    if (res.status === 429) {
      return {
        success: false,
        images: [],
        totalHits: 0,
        message: 'Pixabay API rate limit exceeded. Please try again in a few minutes.',
      };
    }

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        images: [],
        totalHits: 0,
        message: `Pixabay API Error (${res.status}): ${errorText}`,
      };
    }

    const data = await res.json();
    const hits = data.hits || [];

    const images: PixabayImageResult[] = hits.map((item: any) => ({
      id: item.id.toString(),
      url: item.largeImageURL || item.webformatURL,
      thumbnailUrl: item.previewURL || item.webformatURL,
      sourceUrl: item.pageURL,
      photographer: item.user || 'Pixabay Contributor',
      photographerUrl: item.user_id ? `https://pixabay.com/users/${item.user}-${item.user_id}/` : undefined,
      width: item.imageWidth || 1920,
      height: item.imageHeight || 1080,
      tags: item.tags || '',
      alt: `${cleanQuery} - ${item.tags || 'Real Photography'}`,
      source: 'Pixabay',
    }));

    return {
      success: true,
      images,
      totalHits: data.totalHits || 0,
    };
  } catch (err: any) {
    console.error('Pixabay service error:', err);
    return {
      success: false,
      images: [],
      totalHits: 0,
      message: err?.message || 'Failed to communicate with Pixabay API.',
    };
  }
}

export async function fetchPixabayImage(query: string): Promise<string | null> {
  const result = await searchPixabayImages(query, { perPage: 10 });
  if (result.success && result.images.length > 0) {
    return result.images[0].url;
  }
  return null;
}

