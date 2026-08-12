import { NextResponse } from 'next/server';
import { Product, ensureDbSynced } from '@/lib/db';

function parseImages(images: unknown): string | null {
  if (!images) return null;
  if (typeof images === 'string') return images;
  if (Array.isArray(images)) return JSON.stringify(images);
  return null;
}

function primaryImage(image: string | null | undefined, images: string | null): string | null {
  if (image) return image;
  if (!images) return null;
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    await ensureDbSynced();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const admin = searchParams.get('admin') === 'true';

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (!admin) where.status = 'active';

    const products = await Product.findAll({ where, order: [['name', 'ASC']] });
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbSynced();
    const body = await request.json();
    const {
      name,
      description,
      category,
      stock,
      salePrice,
      compareAtPrice,
      costPrice,
      sku,
      images,
      image,
      status,
    } = body;

    if (!name || salePrice === undefined) {
      return NextResponse.json({ error: 'Title and selling price are required' }, { status: 400 });
    }

    const imagesJson = parseImages(images);
    const primary = primaryImage(image, imagesJson);

    const product = await Product.create({
      name,
      description: description || null,
      category: category || 'General',
      stock: parseInt(stock) || 0,
      salePrice: parseFloat(salePrice) || 0,
      compareAtPrice: parseFloat(compareAtPrice) || 0,
      costPrice: parseFloat(costPrice) || 0,
      sku: sku || null,
      code: sku || `SKU-${Date.now()}`,
      images: imagesJson,
      image: primary,
      status: status || 'active',
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDbSynced();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await Product.destroy({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDbSynced();
    const body = await request.json();
    const {
      id,
      name,
      description,
      category,
      stock,
      salePrice,
      compareAtPrice,
      costPrice,
      sku,
      images,
      image,
      status,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const imagesJson = images !== undefined ? parseImages(images) : product.images;
    const primary = primaryImage(image ?? product.image, imagesJson);

    await product.update({
      name,
      description: description ?? product.description,
      category: category ?? product.category,
      stock: stock !== undefined ? parseInt(stock) : product.stock,
      salePrice: salePrice !== undefined ? parseFloat(salePrice) : product.salePrice,
      compareAtPrice: compareAtPrice !== undefined ? parseFloat(compareAtPrice) : product.compareAtPrice,
      costPrice: costPrice !== undefined ? parseFloat(costPrice) : product.costPrice,
      sku: sku ?? product.sku,
      code: sku ?? product.code,
      images: imagesJson,
      image: primary,
      status: status ?? product.status,
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
