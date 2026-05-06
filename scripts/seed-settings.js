// Script to reset settings with proper defaults
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://anhd78428_db_user:GhCkOuOF6D2M9AdC@cluster0.vciyhdq.mongodb.net/?appName=Cluster0";

async function resetSettings() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(); // uses default db from URI
    
    // Delete old settings
    await db.collection('settings').deleteMany({});
    console.log('Old settings deleted.');

    // Insert fresh settings with full defaults
    await db.collection('settings').insertOne({
      siteName: 'VietChi',
      siteTitle: 'Hải Sản Khô Thượng Hạng',
      logo: '',
      favicon: '',
      contactEmail: 'contact@vietchi.vn',
      contactPhone: '0909 123 456',
      contactAddress: 'Rạch Giá, Kiên Giang',
      googleMapsLink: '',
      workingHours: '8:00 - 21:00 (Thứ 2 - Chủ Nhật)',
      socialFacebook: '',
      socialInstagram: '',
      socialTiktok: '',
      socialYoutube: '',
      announcementText: 'Miễn phí vận chuyển cho đơn hàng trên 500k!',
      announcementActive: true,
      brandStory: 'VietChi mang đến những mẻ cá tươi ngon nhất từ vùng biển Kiên Giang, phơi nắng tự nhiên, giữ trọn hương vị biển cả.',
      footerText: 'Đặc Sản Kiên Giang. Bảo lưu mọi quyền.',
      aiRole: 'Bạn là trợ lý bán hàng chuyên nghiệp của VietChi, chuyên tư vấn hải sản khô.',
      banners: [
        {
          tag: 'Đặc sản Kiên Giang',
          title: 'Hải Sản Khô Thượng Hạng',
          subtitle: 'Tuyển chọn từ những mẻ cá tươi ngon nhất, phơi nắng tự nhiên giữ trọn hương vị biển cả.',
          image: 'https://images.unsplash.com/photo-1544070078-a212eaa27b45?q=80&w=2069&auto=format&fit=crop',
          link: '#products-section'
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('New settings created with default banner!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    process.exit(0);
  }
}

resetSettings();
