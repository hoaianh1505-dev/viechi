const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Đã kết nối MongoDB...');

    const adminEmail = 'admin@gmail.com';
    const adminPassword = '123456';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Xóa admin cũ nếu có và tạo mới
    await User.findOneAndDelete({ email: adminEmail });
    
    await User.create({
      name: 'Quản trị viên',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('-----------------------------------');
    console.log('TẠO TÀI KHOẢN ADMIN THÀNH CÔNG!');
    console.log('Email: ' + adminEmail);
    console.log('Mật khẩu: ' + adminPassword);
    console.log('-----------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Lỗi seed admin:', error);
    process.exit(1);
  }
}

seedAdmin();
