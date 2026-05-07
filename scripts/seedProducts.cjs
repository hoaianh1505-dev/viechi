const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  gallery: { type: [String], default: [] },
  category: { type: String, default: '' },
  unit: { type: String, default: 'kg' },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const products = [
  {
    "name": "Mật ong rừng",
    "price": 300000,
    "description": "Mật ong rừng nguyên chất được khai thác tự nhiên, màu vàng óng, vị ngọt thanh và thơm đặc trưng. Phù hợp dùng pha nước, ngâm chanh và bồi bổ sức khỏe.",
    "image": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1974&auto=format&fit=crop",
    "gallery": [],
    "category": "Mật ong",
    "unit": "lít"
  },
  {
    "name": "Mật ong rừng loại 1 lít",
    "price": 1200000,
    "description": "Mật ong rừng nguyên chất đóng chai 1 lít, thích hợp sử dụng cho gia đình. Cam kết không pha tạp và giữ nguyên hương vị tự nhiên.",
    "image": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?q=80&w=2070&auto=format&fit=crop",
    "gallery": [],
    "category": "Mật ong",
    "unit": "lít"
  },
  {
    "name": "Khô sặc bổi",
    "price": 300000,
    "description": "Khô sặc bổi được làm từ cá tươi tuyển chọn, thịt dai ngon và vị đậm đà tự nhiên. Thích hợp chiên giòn hoặc nướng.",
    "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop",
    "gallery": [],
    "category": "Khô cá",
    "unit": "kg"
  },
  {
    "name": "Khô sặc đồng",
    "price": 250000,
    "description": "Khô sặc đồng dân dã miền Tây, được phơi vừa nắng nên giữ được độ dai và vị ngọt tự nhiên.",
    "image": "https://images.unsplash.com/photo-1584263343327-0130f14652c7?q=80&w=2070&auto=format&fit=crop",
    "gallery": [],
    "category": "Khô cá",
    "unit": "kg"
  },
  {
    "name": "Khô chạch đại",
    "price": 560000,
    "description": "Khô chạch đại loại lớn khoảng 40-45 con mỗi ký, thịt chắc và thơm ngon đặc trưng.",
    "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop",
    "gallery": [],
    "category": "Khô cá",
    "unit": "kg"
  },
  {
    "name": "Khô chạch trung",
    "price": 500000,
    "description": "Khô chạch trung khoảng 65-70 con mỗi ký, được sơ chế sạch và phơi tự nhiên.",
    "image": "https://images.unsplash.com/photo-1584263343327-0130f14652c7?q=80&w=2070&auto=format&fit=crop",
    "gallery": [],
    "category": "Khô cá",
    "unit": "kg"
  },
  {
    "name": "Khô cá chèn đồng loại lớn",
    "price": 550000,
    "description": "Khô cá chèn đồng loại lớn từ 20-25 con mỗi ký, thịt ngọt và săn chắc.",
    "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop",
    "gallery": [],
    "category": "Khô cá",
    "unit": "kg"
  },
  {
    "name": "Khô cá chèn đồng loại nhỏ",
    "price": 450000,
    "description": "Khô cá chèn đồng loại nhỏ khoảng 45-50 con mỗi ký, được tẩm ướp vừa ăn và phơi sạch tự nhiên.",
    "image": "https://images.unsplash.com/photo-1584263343327-0130f14652c7?q=80&w=2070&auto=format&fit=crop",
    "gallery": [],
    "category": "Khô cá",
    "unit": "kg"
  },
  {
    "name": "Khô cá chèn trung",
    "price": 500000,
    "description": "Khô cá chèn trung khoảng 30-35 con mỗi ký, thịt dai và thơm ngon.",
    "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop",
    "gallery": [],
    "category": "Khô cá",
    "unit": "kg"
  },
  {
    "name": "Khô lóc non sẽ",
    "price": 220000,
    "description": "Khô lóc non được làm từ cá lóc tươi, thịt mềm và vị đậm đà.",
    "image": "https://images.unsplash.com/photo-1584263343327-0130f14652c7?q=80&w=2070&auto=format&fit=crop",
    "gallery": [],
    "category": "Khô cá",
    "unit": "kg"
  },
  {
    "name": "Khô rắn nước bông súng",
    "price": 400000,
    "description": "Khô rắn nước đặc sản miền Tây, thịt săn chắc và thơm ngon đặc trưng.",
    "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop",
    "gallery": [],
    "category": "Đặc sản",
    "unit": "kg"
  },
  {
    "name": "Khô diêu hồng",
    "price": 220000,
    "description": "Khô diêu hồng được làm sạch kỹ càng, thịt cá ngọt và ít xương.",
    "image": "https://images.unsplash.com/photo-1584263343327-0130f14652c7?q=80&w=2070&auto=format&fit=crop",
    "gallery": [],
    "category": "Khô cá",
    "unit": "kg"
  },
  {
    "name": "Chạch sẽ rút xương",
    "price": 560000,
    "description": "Chạch sẽ đã được rút xương kỹ càng, tiện lợi khi chế biến và thưởng thức.",
    "image": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=2070&auto=format&fit=crop",
    "gallery": [],
    "category": "Đặc sản",
    "unit": "kg"
  },
  {
    "name": "Nhái cơm",
    "price": 600000,
    "description": "Nhái cơm tươi ngon, thịt săn chắc và giàu dinh dưỡng.",
    "image": "https://images.unsplash.com/photo-1584263343327-0130f14652c7?q=80&w=2070&auto=format&fit=crop",
    "gallery": [],
    "category": "Đặc sản",
    "unit": "kg"
  },
  {
    "name": "Hạt sen tươi lột sạch",
    "price": 160000,
    "description": "Hạt sen tươi đã được lột sạch vỏ, hạt đều và bùi ngon.",
    "image": "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?q=80&w=1974&auto=format&fit=crop",
    "gallery": [],
    "category": "Nông sản",
    "unit": "kg"
  },
  {
    "name": "Tim sen (nhị sen)",
    "price": 400000,
    "description": "Tim sen nguyên chất được tuyển chọn kỹ, thường dùng pha trà giúp thư giãn và ngủ ngon.",
    "image": "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1974&auto=format&fit=crop",
    "gallery": [],
    "category": "Nông sản",
    "unit": "kg"
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Đã kết nối MongoDB...');

    // Xóa sản phẩm cũ nếu bro muốn (Tùy chọn)
    // await Product.deleteMany({});
    // console.log('Đã xóa sản phẩm cũ...');

    await Product.insertMany(products);
    console.log('Đã nạp thành công 16 sản phẩm đặc sản!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Lỗi khi nạp dữ liệu:', error);
  }
}

seedProducts();
