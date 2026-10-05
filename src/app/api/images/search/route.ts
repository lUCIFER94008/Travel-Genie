import { NextResponse } from 'next/server';
import { searchPixabayImages } from '@/lib/pixabay';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '20', 10);
    const orientation = (searchParams.get('orientation') as any) || 'horizontal';

    if (!query) {
      return NextResponse.json(
        { success: false, images: [], totalHits: 0, message: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const result = await searchPixabayImages(query, {
      page,
      perPage,
      orientation,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: result.message?.includes('missing') ? 503 : 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Images Search Error:', error);
    return NextResponse.json(
      { success: false, images: [], totalHits: 0, message: 'Internal server error while searching images' },
      { status: 500 }
    );
  }
}
