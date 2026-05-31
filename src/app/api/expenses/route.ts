import { NextResponse } from 'next/server';
import { Expense, ensureDbSynced } from '@/lib/db';

export async function GET() {
  try {
    await ensureDbSynced();
    const expenses = await Expense.findAll({ order: [['date', 'DESC']] });
    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbSynced();
    const body = await request.json();
    const { description, amount } = body;

    if (!description || amount === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const expense = await Expense.create({
      description,
      amount,
      date: new Date(),
    });

    return NextResponse.json(expense);
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

    await Expense.destroy({ where: { id } });
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
    const { id, description, amount } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    await expense.update({ description, amount });
    return NextResponse.json(expense);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
