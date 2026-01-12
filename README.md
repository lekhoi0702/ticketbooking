# TicketBox Clone - Hệ thống Đặt vé Sự kiện

Dự án clone trang web TicketBox.vn với đầy đủ chức năng frontend và backend API.

## 📁 Cấu trúc Project

```
ticketbooking/
├── ticketbookingapi/          # Backend API (Flask + MySQL)
│   ├── app/
│   │   ├── models/            # Database models
│   │   ├── routes/            # API endpoints
│   │   ├── config.py          # Cấu hình database
│   │   └── __init__.py        # App initialization
│   ├── migrations/            # Database migrations
│   ├── seed_data.py           # Script seed dữ liệu mẫu
│   ├── .env                   # Environment variables
│   └── requirements.txt       # Python dependencies
│
├── ticketbookingwebapp/       # Frontend (React + Bootstrap)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API services
│   │   ├── App.jsx            # Main app component
│   │   └── index.css          # Global styles
│   └── package.json           # Node dependencies
│
├── uploads/                   # Thư mục lưu ảnh/video
│   └── events/                # Ảnh sự kiện
│
└── script.txt                 # Database schema SQL
```

## 🚀 Hướng dẫn Cài đặt

### 1. Backend API (Flask)

#### Cài đặt dependencies:
```bash
cd ticketbookingapi
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

#### Cấu hình Database:
File `.env` đã được cấu hình sẵn với database MySQL trên Aiven Cloud.

#### Tạo Database Tables:
Database schema đã được định nghĩa trong file `script.txt`. Bạn có thể:
- Chạy script SQL trực tiếp vào MySQL
- Hoặc sử dụng Flask-Migrate (đang gặp lỗi authentication)

#### Seed dữ liệu mẫu:
```bash
.\venv\Scripts\activate
python seed_data.py
```

#### Chạy Backend Server:
```bash
.\venv\Scripts\activate
python run.py
```

Server sẽ chạy tại: `http://localhost:5000`

### 2. Frontend (React)

#### Cài đặt dependencies:
```bash
cd ticketbookingwebapp
npm install
```

#### Chạy Development Server:
```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## 📊 Database Schema

### Các bảng chính:
- **Role**: Vai trò người dùng (Admin, Event Manager, Customer)
- **User**: Thông tin người dùng
- **EventCategory**: Danh mục sự kiện (Nhạc sống, Sân khấu, Thể thao...)
- **Venue**: Địa điểm tổ chức sự kiện
- **Event**: Thông tin sự kiện
- **TicketType**: Loại vé cho mỗi sự kiện
- **Order**: Đơn hàng
- **Payment**: Thanh toán
- **Ticket**: Vé đã mua
- **Discount**: Mã giảm giá
- **Review**: Đánh giá sự kiện

## 🎨 Frontend Components

### Components chính:
- **Header**: Logo, search bar, navigation
- **HeroBanner**: Carousel banner sự kiện nổi bật
- **EventCard**: Card hiển thị thông tin sự kiện
- **EventSection**: Section danh sách sự kiện theo category
- **TrendingSection**: Section sự kiện xu hướng với ranking
- **Footer**: Footer với thông tin liên hệ

### Features:
- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Bootstrap styling
- ✅ React Icons
- ✅ Carousel slider
- ✅ Event filtering by category
- ✅ Search functionality (ready)
- ✅ API integration với mock data fallback

## 🔌 API Endpoints

### Events:
- `GET /api/events` - Lấy danh sách sự kiện (có filter, pagination)
- `GET /api/events/:id` - Lấy chi tiết sự kiện
- `GET /api/events/featured` - Lấy sự kiện nổi bật
- `GET /api/events/search?q=query` - Tìm kiếm sự kiện

### Categories:
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/categories/:id` - Lấy chi tiết danh mục

### Health Check:
- `GET /api/health` - Kiểm tra API status

## 🎯 Tính năng hiện tại

### ✅ Đã hoàn thành:
- Frontend UI clone TicketBox
- Database schema design
- Backend API structure
- Mock data integration
- Responsive design
- Component architecture

### 🚧 Đang phát triển:
- Database connection (gặp lỗi authentication)
- Real API integration
- User authentication
- Booking system
- Payment integration

### 📝 Kế hoạch tiếp theo:
1. Fix database connection issue
2. Seed database với dữ liệu mẫu
3. Switch từ mock data sang real API
4. Implement search functionality
5. Add event detail page
6. Implement booking flow
7. Add user authentication
8. Payment gateway integration

## 🛠️ Technologies

### Backend:
- Flask (Python web framework)
- Flask-SQLAlchemy (ORM)
- Flask-Migrate (Database migrations)
- Flask-CORS (Cross-origin requests)
- PyMySQL (MySQL connector)
- MySQL (Database)

### Frontend:
- React 18
- Vite (Build tool)
- Bootstrap 5
- React-Bootstrap
- React Icons
- Vanilla CSS

## 📸 Screenshots

Xem screenshots trong thư mục `.gemini/antigravity/brain/`

## 🐛 Known Issues

1. **Database Connection**: Gặp lỗi `caching_sha2_password auth methods` khi kết nối MySQL
   - Đang sử dụng mock data thay thế
   - Cần cấu hình SSL/TLS cho Aiven Cloud MySQL

2. **Image Uploads**: Thư mục `uploads/` đã tạo nhưng chưa có ảnh thực tế
   - Đang sử dụng Unsplash images

## 👨‍💻 Development

### Chạy cả Backend và Frontend:

Terminal 1 (Backend):
```bash
cd ticketbookingapi
.\venv\Scripts\activate
python run.py
```

Terminal 2 (Frontend):
```bash
cd ticketbookingwebapp
npm run dev
```

### Switch giữa Mock Data và Real API:

Trong file `src/services/api.js`, thay đổi:
```javascript
const USE_MOCK_DATA = true;  // false để dùng real API
```

## 📞 Support

Nếu gặp vấn đề, vui lòng kiểm tra:
1. Database connection trong `.env`
2. Backend server đang chạy
3. Frontend dev server đang chạy
4. CORS được enable

## 📄 License

This is a learning project - TicketBox clone for educational purposes.
