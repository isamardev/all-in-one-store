import { NextResponse } from 'next/server';
import { Product, ensureDbSynced } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbSynced();
    const { id } = await params;
    const product = await Product.findByPk(id);

    if (!product || product.status === 'draft') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
