export interface ImageValidationResult {
  valid: boolean;
  reason?: string;
  isPixabay?: boolean;
}

export async function validateImageUrl(url: string): Promise<ImageValidationResult> {
  if (!url || typeof url !== 'string') {
    return { valid: false, reason: 'URL is missing or invalid type' };
  }

  const cleanUrl = url.trim();

  // 1. Verify not a Wikimedia URL
  if (cleanUrl.includes('wikimedia.org') || cleanUrl.includes('wikipedia.org')) {
    return { valid: false, reason: 'Wikimedia URLs are deprecated. Please use Pixabay images.' };
  }

  // 2. Check protocol and valid URL structure
  try {
    const parsed = new URL(cleanUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, reason: 'Invalid protocol. Must be HTTP or HTTPS.' };
    }

    const isPixabay = parsed.hostname.includes('pixabay.com');

    return {
      valid: true,
      isPixabay,
    };
  } catch {
    return { valid: false, reason: 'Malformed URL structure' };
  }
}
