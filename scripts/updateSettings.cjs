const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const SettingsSchema = new mongoose.Schema({
  siteName: String,
  siteTitle: String,
  contactAddress: String,
  brandStory: String,
  announcementText: String,
  footerText: String
}, { strict: false });

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

async function updateToDongThap() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Đã kết nối MongoDB...');

    const updateData = {
      siteTitle: 'Đặc Sản Đồng Tháp - Khô Cá Đồng Tháp Mười',
      contactAddress: 'Xã Mỹ Quý, Huyện Tháp Mười, Tỉnh Đồng Tháp',
      brandStory: 'VietChi tự hào mang đến những mẻ khô cá đồng tinh túy nhất từ vùng đất Tháp Mười sen hồng, giữ trọn hương vị phù sa và nắng gió Đồng Tháp.',
      announcementText: 'Đặc sản Tháp Mười - Giao hàng toàn quốc!',
      footerText: '© 2024 VietChi - Đặc Sản Tháp Mười Đồng Tháp. Bảo lưu mọi quyền.'
    };

    // Cập nhật tất cả các bản ghi settings (thường chỉ có 1)
    await Settings.updateMany({}, updateData);
    console.log('Đã cập nhật thông tin thương hiệu sang Đồng Tháp Mười thành công!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Lỗi khi cập nhật:', error);
  }
}

updateToDongThap();
