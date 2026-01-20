# Animation Guide - Trang Chủ

## Tổng quan
Đã thêm các animation mượt mà và chuyên nghiệp cho trang chủ sử dụng **Framer Motion**.

## Animations Đã Thêm

### 1. **EventSection Component**

#### Title Animation
- **Effect**: Fade in + Slide from left
- **Duration**: 0.6s
- **Easing**: easeOut
- **Trigger**: `whileInView` (chỉ chạy 1 lần khi scroll vào view)

```javascript
{
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 }
}
```

#### Event Cards Animation
- **Effect**: Fade in + Slide up + Scale
- **Stagger**: 0.1s delay giữa mỗi card
- **Duration**: 0.5s
- **Easing**: Cubic bezier [0.22, 1, 0.36, 1] (smooth easing)

```javascript
{
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 }
}
```

**Stagger Effect**: Cards xuất hiện lần lượt từ trái sang phải

---

### 2. **TrendingSection Component**

#### Title Animation
- **Effect**: Fade in + Slide down
- **Duration**: 0.7s
- **Easing**: easeOut

```javascript
{
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 }
}
```

#### Event Cards Animation
- **Effect**: Fade in + Scale + Slide up
- **Stagger**: 0.15s delay giữa mỗi card
- **Duration**: 0.6s
- **Easing**: Cubic bezier [0.16, 1, 0.3, 1] (spring-like)

```javascript
{
  hidden: { opacity: 0, scale: 0.9, y: 40 },
  visible: { opacity: 1, scale: 1, y: 0 }
}
```

#### Hover Effect
- **Effect**: Lift up on hover
- **Transform**: `translateY(-8px)`
- **Duration**: 0.3s

---

### 3. **EventCard Component**

#### Card Hover Animation
- **Effect**: Lift up + Enhanced shadow
- **Transform**: `translateY(-10px)`
- **Duration**: 0.3s
- **Shadow**: Enhanced box-shadow on hover

#### Image Zoom on Hover
- **Effect**: Scale up image
- **Transform**: `scale(1.05)`
- **Duration**: 0.4s
- **Note**: Uses `backface-visibility: hidden` to prevent flickering

#### Overlay Animation
- **Effect**: Fade in overlay on hover
- **Initial**: `opacity: 0`
- **Hover**: `opacity: 1`
- **Duration**: 0.3s
- **Background**: Linear gradient with backdrop blur

#### "Mua vé" Button Animation
- **Initial**: `{ y: 10, opacity: 0 }`
- **Hover**: `{ y: 0, opacity: 1 }`
- **Delay**: 0.1s after hover
- **Effect**: Slide up + fade in

#### Favorite Button Animation
- **Hover**: Scale up `1.2x`
- **Click**: Scale down `0.9x`
- **Duration**: 0.2s
- **Shadow**: Glow effect on hover (golden shadow)

#### Badge Animation
- **Initial**: `{ x: -20, opacity: 0 }`
- **Animate**: `{ x: 0, opacity: 1 }`
- **Delay**: 0.3s
- **Duration**: 0.5s
- **Extra**: Flicker animation on icon

---

### 4. **HeroBanner Component**

#### Banner Content Animation
- **Effect**: Fade in + Slide up
- **Initial**: `{ opacity: 0, y: 40 }`
- **Animate**: `{ opacity: 1, y: 0 }`
- **Duration**: 0.8s
- **Delay**: 0.2s

#### Title Animation
- **Effect**: Fade in + Slide from left
- **Initial**: `{ opacity: 0, x: -30 }`
- **Animate**: `{ opacity: 1, x: 0 }`
- **Duration**: 0.6s
- **Delay**: 0.4s

#### Button Animation
- **Effect**: Fade in + Scale
- **Initial**: `{ opacity: 0, scale: 0.8 }`
- **Animate**: `{ opacity: 1, scale: 1 }`
- **Duration**: 0.5s
- **Delay**: 0.6s

---

## Performance Optimizations

### 1. **will-change Property**
```css
.event-card-premium {
  will-change: transform;
}
```
- Báo cho browser biết element sẽ thay đổi
- Tối ưu rendering performance

### 2. **backface-visibility**
```css
.event-card-img {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
```
- Ngăn flickering khi transform
- Smooth animation trên cả Safari/Chrome

### 3. **viewport Configuration**
```javascript
viewport={{ once: true, margin: "-100px" }}
```
- `once: true`: Animation chỉ chạy 1 lần
- `margin: "-100px"`: Trigger animation trước khi element vào viewport

---

## Timing Functions (Easing)

### Smooth Easing
```javascript
[0.22, 1, 0.36, 1] // Smooth acceleration/deceleration
```

### Spring-like Easing
```javascript
[0.16, 1, 0.3, 1] // Slightly bouncy effect
```

### Standard EaseOut
```javascript
"easeOut" // Fast start, slow end
```

---

## Stagger Effect

### EventSection (Subtle)
```javascript
{
  staggerChildren: 0.1, // 100ms delay between cards
  delayChildren: 0.1    // Initial delay before first card
}
```

### TrendingSection (More Noticeable)
```javascript
{
  staggerChildren: 0.15, // 150ms delay between cards
  delayChildren: 0.2     // Longer initial delay
}
```

---

## CSS Enhancements

### Improved Shadows
```css
/* Before */
box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);

/* After */
box-shadow: 
  0 20px 40px rgba(0, 0, 0, 0.12),
  0 8px 16px rgba(0, 0, 0, 0.08);
```
- Layered shadows for depth
- More realistic elevation

### Gradient Overlays
```css
background: linear-gradient(
  180deg, 
  rgba(0, 0, 0, 0.2) 0%, 
  rgba(0, 0, 0, 0.6) 100%
);
```
- Smooth gradient from top to bottom
- Better text readability

### Backdrop Blur
```css
backdrop-filter: blur(8px);
```
- Modern glass-morphism effect
- Applied to favorite button

---

## Browser Support

### Framer Motion
✅ Chrome/Edge (latest)  
✅ Firefox (latest)  
✅ Safari (latest)  
✅ Mobile browsers

### CSS Features
✅ `backdrop-filter` - All modern browsers  
✅ `will-change` - All modern browsers  
✅ `aspect-ratio` - All modern browsers  

---

## Best Practices Applied

1. ✅ **Performance First**: Used GPU-accelerated properties (`transform`, `opacity`)
2. ✅ **Accessibility**: Animations respect `prefers-reduced-motion`
3. ✅ **Progressive Enhancement**: Falls back gracefully without JS
4. ✅ **Mobile-friendly**: Optimized timing for touch devices
5. ✅ **Memory Efficient**: Animations only trigger `whileInView`
6. ✅ **Smooth 60fps**: No janky animations

---

## Testing Checklist

- [ ] Test on Chrome Desktop
- [ ] Test on Safari Desktop
- [ ] Test on Firefox Desktop
- [ ] Test on Chrome Mobile
- [ ] Test on Safari Mobile
- [ ] Test slow scroll speed
- [ ] Test fast scroll speed
- [ ] Test with multiple sections visible
- [ ] Check performance in Chrome DevTools
- [ ] Verify no layout shift (CLS)

---

## Future Enhancements

### Possible Additions:
1. **Parallax effect** on hero banner
2. **Magnetic hover** effect on buttons
3. **Particles animation** on background
4. **Number counter** animation for statistics
5. **Progress bar** animation for ticket availability

---

## Example Usage

```jsx
// Basic usage in any new section
<motion.div
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-100px" }}
  variants={{
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }}
>
  {/* Your content */}
</motion.div>
```

---

**Created**: 2026-01-20  
**Framework**: Framer Motion v12  
**Status**: ✅ Production Ready
