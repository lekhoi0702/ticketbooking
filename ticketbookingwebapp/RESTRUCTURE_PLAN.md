# 📋 Kế Hoạch Tái Cấu Trúc Hệ Thống File

## 🎯 Mục tiêu
Tái cấu trúc codebase để dễ maintain, mở rộng và phân chia rõ ràng theo features.

## 📂 Cấu Trúc Mới

```
src/
├── features/
│   ├── admin/
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx
│   │   │   └── AdminLoadingScreen.jsx (+ .css)
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── Users.jsx
│   │       ├── Events.jsx
│   │       ├── Orders.jsx
│   │       ├── Venues.jsx
│   │       └── Login.jsx
│   │
│   ├── organizer/
│   │   ├── components/
│   │   │   ├── OrganizerLayout.jsx
│   │   │   ├── EventTable.jsx
│   │   │   ├── EventBasicInfo.jsx
│   │   │   ├── TicketConfig.jsx
│   │   │   ├── SeatMapTemplateView.jsx
│   │   │   └── ... (other organizer components)
│   │   └── pages/
│   │       ├── EventList.jsx
│   │       ├── CreateEvent.jsx
│   │       ├── EditEvent.jsx
│   │       ├── EventDetails.jsx
│   │       ├── EventOrders.jsx
│   │       ├── ManageSeats.jsx
│   │       ├── OrganizerHome.jsx
│   │       └── Login.jsx
│   │
│   └── user/
│       ├── components/
│       │   ├── UserLayout.jsx
│       │   ├── Header.jsx (+ .css)
│       │   ├── Footer.jsx (+ .css)
│       │   ├── EventCard.jsx (+ .css)
│       │   ├── TrendingSection.jsx
│       │   ├── CategorySection.jsx
│       │   ├── AuthModal.jsx
│       │   ├── OrganizerAuthModal.jsx
│       │   └── ... (other user components)
│       └── pages/
│           ├── Home.jsx (+ .css)
│           ├── EventDetail.jsx (+ .css)
│           ├── Checkout.jsx (+ .css)
│           ├── OrderSuccess.jsx
│           ├── VNPayReturn.jsx
│           ├── MyOrders.jsx (+ .css)
│           ├── MyTickets.jsx (+ .css)
│           ├── SearchResults.jsx
│           ├── CategoryEvents.jsx
│           └── Profile.jsx
│
├── shared/
│   ├── components/
│   │   └── (common components if any)
│   ├── hooks/
│   │   ├── useAuth.js (from context/AuthContext)
│   │   ├── useEventList.js
│   │   ├── useCategories.js
│   │   ├── useVenues.js
│   │   └── useTicketTypes.js
│   ├── utils/
│   │   ├── formatters.js (date, currency, etc)
│   │   └── validators.js
│   └── constants/
│       ├── api.js (API_BASE_URL)
│       ├── status.js (STATUS_CONFIG)
│       └── routes.js (ROUTE_PATHS)
│
├── services/
│   └── api/
│       ├── index.js (main api object)
│       ├── admin.js
│       ├── organizer.js
│       ├── user.js
│       ├── events.js
│       ├── orders.js
│       └── ... (other api modules)
│
├── context/
│   └── AuthContext.jsx (keep as is)
│
├── theme/
│   └── AntdThemeConfig.js
│
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

## 🔄 Di Chuyển Files

### Phase 1: Admin Feature
- [ ] Move `components/Admin/*` → `features/admin/components/`
- [ ] Move `pages/admin/*` → `features/admin/pages/`

### Phase 2: Organizer Feature
- [ ] Move `components/Organizer/*` → `features/organizer/components/`
- [ ] Move `pages/organizer/*` → `features/organizer/pages/`

### Phase 3: User Feature
- [ ] Move `components/Customer/*` → `features/user/components/`
- [ ] Move `pages/user/*` → `features/user/pages/`
- [ ] Move `components/event/*` → `features/user/components/`
- [ ] Move `components/layout/*` → `features/user/components/`

### Phase 4: Shared Resources
- [ ] Move `hooks/*` → `shared/hooks/`
- [ ] Move `utils/*` → `shared/utils/`
- [ ] Move `constants/*` → `shared/constants/`
- [ ] Extract constants from files to `shared/constants/`

### Phase 5: Update Imports
- [ ] Update all import paths in moved files
- [ ] Update App.jsx imports
- [ ] Test all features

## ⚠️ Lưu Ý
- Di chuyển từng phase một
- Test sau mỗi phase
- Update imports ngay sau khi di chuyển
- Giữ nguyên tên file để dễ track

## 🎯 Kết Quả Mong Đợi
- ✅ Code dễ tìm và maintain
- ✅ Phân chia rõ ràng theo features
- ✅ Shared code được tái sử dụng
- ✅ Import paths ngắn gọn hơn
