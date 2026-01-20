# ✨ Animation Quickstart Guide

## Xem ngay Animation

### 1. Khởi động server

```bash
# Terminal 1 - Backend
cd ticketbookingapi
python run.py

# Terminal 2 - Frontend
cd ticketbookingwebapp
npm run dev
```

### 2. Mở trình duyệt
```
http://localhost:5173
```

### 3. Xem các animation

#### 🎬 **Animation khi load trang**
- Scroll xuống từ từ
- Các event cards sẽ xuất hiện lần lượt với hiệu ứng:
  - ✨ Fade in (mờ dần hiện ra)
  - ⬆️ Slide up (trượt từ dưới lên)
  - 📏 Scale (phóng to nhẹ)

#### 🖱️ **Animation khi hover**
- Di chuột qua event card:
  - Card nhấc lên (lift up effect)
  - Hình ảnh phóng to (zoom in)
  - Overlay xuất hiện với nút "Mua vé"
  - Shadow tăng độ đậm

#### ⭐ **Favorite Button Animation**
- Di chuột qua nút yêu thích:
  - Scale up 1.2x
  - Golden glow effect
- Click:
  - Scale down 0.9x (bounce)

#### 🔥 **Badge Animation**
- Badge "HOT" xuất hiện từ trái
- Icon lửa có hiệu ứng nhấp nháy (flicker)

---

## Các Section có Animation

### 1. **Sự kiện đặc biệt**
- Title slide từ trái
- Cards stagger 0.1s

### 2. **Sự kiện bán chạy nhất**
- Title slide từ trên
- Cards stagger 0.15s (chậm hơn)
- Hover lift stronger

### 3. **Các section theo danh mục**
- Nhạc sống
- Sân khấu
- Thể thao

---

## Tips để test tốt nhất

### 🎯 **Chrome DevTools**
```
F12 → Performance → Record
```
- Kiểm tra FPS (phải giữ 60fps)
- Check animation smoothness

### 🐌 **Slow Motion**
```
F12 → Console → Run:
document.documentElement.style.setProperty('--animation-speed', '3')
```

### 📱 **Mobile Test**
```
F12 → Toggle Device Toolbar (Ctrl+Shift+M)
```
- Test trên iPhone/Android
- Swipe to scroll

### ⚡ **Network Throttling**
```
F12 → Network → Throttling → Slow 3G
```
- Test animation khi mạng chậm
- Đảm bảo không lag

---

## Keyboard Shortcuts (Dev)

| Key | Action |
|-----|--------|
| `Ctrl + Shift + C` | Inspect element |
| `F12` | DevTools |
| `Ctrl + R` | Reload |
| `Ctrl + Shift + R` | Hard reload |
| `Ctrl + 0` | Reset zoom |

---

## Animation Performance Metrics

### ✅ **Good Performance**
- FPS: 60fps steady
- Paint time: < 16ms
- No layout shifts
- Smooth on scroll

### ❌ **Bad Performance**
- FPS drops below 30fps
- Janky animations
- Layout shifting
- Slow hover response

---

## Troubleshooting

### Animation không chạy?
1. ✅ Kiểm tra `framer-motion` đã cài đặt
   ```bash
   npm list framer-motion
   ```
2. ✅ Clear browser cache (Ctrl+Shift+Delete)
3. ✅ Hard reload (Ctrl+Shift+R)

### Animation bị giật?
1. ✅ Kiểm tra CPU usage (< 80%)
2. ✅ Đóng các tab khác
3. ✅ Update GPU driver
4. ✅ Disable browser extensions

### Animation quá nhanh/chậm?
- Edit `duration` trong component code
- Mặc định: 0.3s - 0.8s

---

## Video Demo Recording

### Sử dụng Chrome Screen Recording:
```
1. F12 → ... menu → More tools → Rendering
2. Enable "Frame Rendering Stats"
3. Start recording (Ctrl+Shift+R)
4. Scroll through page
5. Stop and save
```

---

## Feedback Checklist

Khi test, chú ý:
- [ ] Animation mượt mà (no jank)
- [ ] Timing hợp lý (không quá nhanh/chậm)
- [ ] Stagger effect rõ ràng
- [ ] Hover responsive ngay lập tức
- [ ] Mobile scroll smooth
- [ ] Không có layout shift
- [ ] FPS ổn định 60fps
- [ ] Shadow/glow đẹp mắt

---

**Ready to test!** 🚀

_Scroll slowly and enjoy the animations!_ ✨
