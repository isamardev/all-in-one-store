import { NextResponse } from 'next/server';
import { Product, ensureDbSynced } from '@/lib/db';

export async function GET() {
  try {
    await ensureDbSynced();
    const products = await Product.findAll();
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
    const { name, code, costPrice, category, stock, salePrice } = body;
    
    if (!name || !code || costPrice === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Check if product already exists with BOTH this name and code
    const existingProduct = await Product.findOne({ where: { name, code } });
    if (existingProduct) {
      // Update stock if provided
      if (stock !== undefined) {
        existingProduct.stock += parseInt(stock);
      }
      // Update sale price if provided
      if (salePrice !== undefined) {
        existingProduct.salePrice = parseFloat(salePrice);
      }
      await existingProduct.save();
      return NextResponse.json(existingProduct);
    }

    const product = await Product.create({ 
      name, 
      code, 
      costPrice, 
      category: category || 'General', 
      stock: stock || 0,
      salePrice: salePrice || 0
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
    const { id, name, code, costPrice, category, stock, salePrice } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await product.update({ name, code, costPrice, category, stock, salePrice });
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
