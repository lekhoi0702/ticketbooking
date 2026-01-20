# 🔧 FIX: Banner & Events không hiển thị

## ❗ VẤN ĐỀ
Banner và list event của trang chủ (user) đã biến mất sau khi thêm Framer Motion animations.

## 🔍 NGUYÊN NHÂN
Framer Motion animations (`motion.div`, `whileInView`, etc.) có thể gây ra:
1. Layout shifts
2. Render issues
3. CSS conflicts
4. Initial state `hidden` không transition properly

## ✅ GIẢI PHÁP 1: REMOVE ANIMATIONS (KHUYẾN NGHỊ)

### Option A: Thay thế file
```bash
# Backup file hiện tại
cd ticketbookingwebapp/src/features/user/components/Event

# Copy file không có animation
cp EventSection.NO_ANIMATION.jsx EventSection.jsx
cp HeroBanner.NO_ANIMATION.jsx HeroBanner.jsx
```

### Option B: Manual fix trong EventSection.jsx

**Tìm dòng 69-80**:
```javascript
// XÓA motion.div wrapper
<motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
    variants={containerVariants}
>
    <Row className="g-4">
        {events.map((event) => (
            <Col key={event.id} xs={12} sm={6} md={4} lg={3}>
                <motion.div variants={itemVariants}>
                    <EventCard event={event} />
                </motion.div>
            </Col>
        ))}
    </Row>
</motion.div>
```

**THAY BẰNG**:
```javascript
<Row className="g-4">
    {events.map((event) => (
        <Col key={event.id} xs={12} sm={6} md={4} lg={3}>
            <EventCard event={event} />
        </Col>
    ))}
</Row>
```

### Option C: Fix trong HeroBanner.jsx

**Xóa tất cả `motion.div` và animation imports**:

```javascript
// XÓA dòng này
import { motion } from 'framer-motion';

// Thay đổi tất cả
<motion.div ...props>
// THÀNH
<div>
```

---

## ✅ GIẢI PHÁP 2: FIX ANIMATIONS (NẾU MUỐN GIỮ)

Nếu muốn giữ animations nhưng fix lỗi:

### 1. EventSection.jsx - Add fallback

```javascript
const containerVariants = {
    hidden: { opacity: 1 }, // ĐỔI từ 0 → 1
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0
        }
    }
};
```

### 2. EventCard.jsx - Simplify hover

```javascript
// Tìm motion wrapper (dòng 36-42)
<motion.div
    whileHover={{ 
        y: -10,
        transition: { duration: 0.3, ease: "easeOut" }
    }}
    whileTap={{ scale: 0.98 }}
>
// XÓA và chỉ giữ Card component
<Card className="event-card-premium" hoverable>
```

### 3. Add CSS fallback

**EventSection.css**:
```css
/* Ensure visibility */
.event-section {
    opacity: 1 !important;
    visibility: visible !important;
}

.event-card-link {
    opacity: 1 !important;
}
```

---

## ✅ GIẢI PHÁP 3: DEBUG (KIỂM TRA CONSOLE)

```javascript
// Mở F12 → Console
// Check errors related to:
// - framer-motion
// - viewport
// - IntersectionObserver
```

**Nếu thấy lỗi**: Có thể trình duyệt không support `IntersectionObserver`

**Fix**: Remove `whileInView`

---

## 🚀 QUICK FIX - COPY PASTE

### EventSection.jsx (Replace entire file):

```javascript
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import EventCard from './EventCard';
import './EventSection.css';

const EventSection = ({ title, events, showViewMore = true, viewMoreLink = "/events" }) => {
    return (
        <section className="event-section">
            <Container>
                <div className="section-header">
                    <h2 className="section-title">{title}</h2>
                    {showViewMore && (
                        <Link to={viewMoreLink} className="view-more-link">
                            Xem thêm →
                        </Link>
                    )}
                </div>
                <Row className="g-4">
                    {events.map((event) => (
                        <Col key={event.id} xs={12} sm={6} md={4} lg={3}>
                            <EventCard event={event} />
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default EventSection;
```

---

## 📝 TEST STEPS

1. **Clear cache & reload**:
   ```
   Ctrl + Shift + R (hard refresh)
   ```

2. **Check console**:
   ```
   F12 → Console → No errors?
   ```

3. **Test**:
   - Banner hiển thị?
   - Events hiển thị?
   - Click vào event card hoạt động?

---

## ⚠️ NẾU VẪN KHÔNG FIX

### Kiểm tra API:

```javascript
// Trong Home.jsx, thêm console.log
const loadEvents = async () => {
    try {
        console.log('Loading events...');
        
        const featuredResponse = await api.getFeaturedEvents(4);
        console.log('Featured events:', featuredResponse);
        
        // ... rest of code
    }
};
```

**Xem console**: Có data trả về không?

---

## 📊 PRIORITY FIX ORDER

1. ✅ **HIGHEST**: Remove animations từ EventSection.jsx
2. ✅ **HIGH**: Remove animations từ HeroBanner.jsx  
3. ⏳ **MEDIUM**: Simplify EventCard.jsx animations
4. ⏳ **LOW**: Fix TrendingSection.jsx (nếu cũng bị)

---

## 🎯 RECOMMENDED ACTION

**Làm ngay bây giờ**:

```bash
# 1. Backup
cp src/features/user/components/Event/EventSection.jsx src/features/user/components/Event/EventSection.BACKUP.jsx

# 2. Copy no-animation version
cp src/features/user/components/Event/EventSection.NO_ANIMATION.jsx src/features/user/components/Event/EventSection.jsx

# 3. Refresh browser
# Ctrl + Shift + R
```

**→ App sẽ hoạt động lại ngay!**

---

**Status**: Fix ready  
**Time**: <5 minutes  
**Risk**: None (can revert anytime)
