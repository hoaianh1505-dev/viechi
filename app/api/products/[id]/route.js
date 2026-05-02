import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import jwt from 'jsonwebtoken';

const checkAdmin = (req) => {
  const token = req.cookies.get('vietchi_token')?.value;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.role === 'admin';
  } catch (e) {
    return false;
  }
};

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ error: 'Không tìm thấy' }, { status: 404 });
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    if (!checkAdmin(req)) return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const product = await Product.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    if (!checkAdmin(req)) return NextResponse.json({ error: 'Không có quyền' }, { status: 403 });
    await dbConnect();
    const { id } = await params;
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Đã xóa sản phẩm' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
