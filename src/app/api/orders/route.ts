import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');
    const orderNumber = searchParams.get('orderNumber');
    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (orderId) where.id = orderId;
    if (orderNumber) where.orderNumber = orderNumber;

    if (orderId || orderNumber) {
      const order = await db.order.findFirst({
        where,
        include: {
          items: true,
          user: { select: { id: true, name: true, email: true } },
        },
      });
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json(order);
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, shippingName, shippingPhone, shippingAddr, shippingCity, shippingCode, expedition, paymentMethod, userId, voucherCode, voucherDisc, subtotal, shippingCost, discount, total } = body;

    const orderNumber = 'NVX-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        status: 'pending',
        subtotal,
        shippingCost: shippingCost || 0,
        discount: discount || 0,
        total,
        shippingName,
        shippingPhone,
        shippingAddr,
        shippingCity,
        shippingCode,
        expedition,
        paymentMethod,
        voucherCode,
        voucherDisc: voucherDisc || 0,
        pointsEarned: Math.floor(total / 10000) * 10,
        items: {
          create: items.map((item: any) => ({
            bookId: item.bookId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            format: item.format,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, orderNumber: order.orderNumber, order }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');
    const body = await request.json();
    const id = queryId || body.id;
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    const order = await db.order.update({
      where: { id },
      data: { status: body.status },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
