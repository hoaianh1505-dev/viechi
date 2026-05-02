import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import jwt from 'jsonwebtoken';

// GET all products - PUBLIC
export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create product - ADMIN ONLY
export async function POST(req) {
  try {
    await dbConnect();
    
    // Verify admin
    const token = req.cookies.get('vietchi_token')?.value;
    if (!token) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });

    const body = await req.json();
    const product = new Product(body);
    await product.save();
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
