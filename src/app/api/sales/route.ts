import { NextResponse } from 'next/server';
import { Sale, Product, ensureDbSynced } from '@/lib/db';

export async function GET() {
  try {
    await ensureDbSynced();
    const sales = await Sale.findAll({ order: [['date', 'DESC']] });
    return NextResponse.json(sales);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbSynced();
    const body = await request.json();
    const { productId, salePrice, code, quantity, discount } = body;

    if (!productId || salePrice === undefined || !code) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const qty = parseInt(quantity) || 1;
    const disc = parseFloat(discount) || 0;

    // Calculate cost price from code: cost = code / 3
    const unitCostPrice = parseFloat(code) / 3;
    const totalCostPrice = unitCostPrice * qty;
    const totalSalePrice = (parseFloat(salePrice) * qty) - disc;
    const profit = totalSalePrice - totalCostPrice;

    // Decrement stock
    const product = await Product.findByPk(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.stock < qty) {
      return NextResponse.json({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}` }, { status: 400 });
    }

    product.stock = Math.max(0, product.stock - qty);
    await product.save();

    const sale = await Sale.create({
      productId,
      quantity: qty,
      salePrice: totalSalePrice,
      costPrice: totalCostPrice,
      discount: disc,
      profit,
      date: new Date(),
    });

    return NextResponse.json(sale);
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

    await Sale.destroy({ where: { id } });
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
    const { id, salePrice, profit } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const sale = await Sale.findByPk(id);
    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    await sale.update({ salePrice, profit });
    return NextResponse.json(sale);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
