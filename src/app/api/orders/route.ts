import { NextResponse } from 'next/server';
import { Order, OrderItem, Product, Sale, ensureDbSynced } from '@/lib/db';

export async function GET() {
  try {
    await ensureDbSynced();
    const orders = await Order.findAll({
      include: [{
        model: OrderItem,
        include: [{ model: Product, attributes: ['id', 'name', 'image'] }],
      }],
      order: [['date', 'DESC']],
    });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbSynced();
    const body = await request.json();
    const { customerName, phone, address, items } = body;

    if (!customerName || !phone || !address || !items?.length) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    let total = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
      }
      total += product.salePrice * item.quantity;
    }

    const order = await Order.create({
      customerName,
      phone,
      address,
      total,
      status: 'pending',
      date: new Date(),
    });

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) continue;

      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: product.salePrice,
      });

      const unitCost = product.costPrice || 0;
      const qty = item.quantity;
      const totalSale = product.salePrice * qty;
      const totalCost = unitCost * qty;

      product.stock = Math.max(0, product.stock - qty);
      await product.save();

      await Sale.create({
        productId: product.id,
        quantity: qty,
        salePrice: totalSale,
        costPrice: totalCost,
        discount: 0,
        profit: totalSale - totalCost,
        date: new Date(),
      });
    }

    return NextResponse.json({ success: true, orderId: order.id, total });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDbSynced();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 });
    }

    const validStatuses = ['pending', 'processing', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await order.update({ status });
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
