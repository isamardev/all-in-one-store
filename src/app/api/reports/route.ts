import { NextResponse } from 'next/server';
import { Sale, Expense, Product, ensureDbSynced } from '@/lib/db';
import { Op } from 'sequelize';
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO, subDays } from 'date-fns';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'day'; // day, month, year
  const dateStr = searchParams.get('date') || new Date().toISOString();
  const date = parseISO(dateStr);

  let startDate, endDate;

  if (type === 'day') {
    startDate = startOfDay(date);
    endDate = endOfDay(date);
  } else if (type === 'month') {
    startDate = startOfMonth(date);
    endDate = endOfMonth(date);
  } else if (type === 'year') {
    startDate = startOfYear(date);
    endDate = endOfYear(date);
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  try {
    await ensureDbSynced();
    const sales = await Sale.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [{ model: Product, attributes: ['name'] }]
    });

    const expenses = await Expense.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate],
        },
      },
    });

    // Dashboard data: Today's sale vs Last month same day
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    
    const todaySales = await Sale.findAll({
      where: { date: { [Op.between]: [todayStart, todayEnd] } }
    });

    const lastMonthDate = subDays(today, 30);
    const lastMonthStart = startOfDay(lastMonthDate);
    const lastMonthEnd = endOfDay(lastMonthDate);

    const lastMonthSales = await Sale.findAll({
      where: { date: { [Op.between]: [lastMonthStart, lastMonthEnd] } }
    });

    return NextResponse.json({
      sales,
      expenses,
      summary: {
        totalSales: sales.reduce((acc, s) => acc + s.salePrice, 0),
        totalProfit: sales.reduce((acc, s) => acc + s.profit, 0),
        totalExpenses: expenses.reduce((acc, e) => acc + e.amount, 0),
        netProfit: sales.reduce((acc, s) => acc + s.profit, 0) - expenses.reduce((acc, e) => acc + e.amount, 0),
      },
      dashboard: {
        todayTotal: todaySales.reduce((acc, s) => acc + s.salePrice, 0),
        lastMonthDayTotal: lastMonthSales.reduce((acc, s) => acc + s.salePrice, 0),
      }
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
