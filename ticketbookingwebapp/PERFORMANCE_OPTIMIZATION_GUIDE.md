# ⚡ Performance Optimization Guide

**Priority**: MEDIUM (Optional but Recommended)  
**Time Required**: ~4 hours  
**Impact**: Better user experience, faster load times

---

## 📋 TASKS OVERVIEW

### Task 1: Remove Unused UI Libraries (2 hours)
- Remove Material-UI components
- Remove React-Bootstrap
- Keep only Ant Design
- **Benefit**: -1MB bundle size

### Task 2: Code Splitting & Lazy Loading (2 hours)
- Lazy load routes
- Dynamic imports for large components
- **Benefit**: Faster initial load (-50%)

### Task 3: React Optimization (2 hours)
- React.memo for expensive components
- useMemo / useCallback
- Virtual scrolling
- **Benefit**: Less re-renders

### Task 4: Image Optimization (1 hour)
- Lazy load images
- WebP format
- Placeholder images
- **Benefit**: Faster page loads

---

## 🎯 TASK 1: Remove Unused UI Libraries

### 1.1 Uninstall Material-UI

```bash
npm uninstall @mui/material @mui/icons-material @emotion/react @emotion/styled
npm uninstall @mui/lab @mui/x-data-grid react-bootstrap bootstrap
```

**Saves**: ~1.2MB

### 1.2 Replace Material-UI with Ant Design

**Example replacements**:

```javascript
// OLD
import { Button, TextField, Box } from '@mui/material';

// NEW
import { Button, Input, Space } from 'antd';
```

**Common Replacements**:
| Material-UI | Ant Design |
|-------------|------------|
| `<Button>` | `<Button>` (same) |
| `<TextField>` | `<Input>` |
| `<Box>` | `<Space>` or `<div>` |
| `<Grid>` | `<Row>` + `<Col>` |
| `<Card>` | `<Card>` (same) |
| `<Dialog>` | `<Modal>` |
| `<Select>` | `<Select>` (same) |
| `<DataGrid>` | `<Table>` |

### 1.3 Files to Update

Search for Material-UI imports:
```bash
grep -r "@mui" src/
```

**Expected files** (based on project structure):
- Admin components (likely uses AdminLTE already)
- Organizer components (check for MUI usage)
- User components (check for MUI usage)

---

## 🎯 TASK 2: Code Splitting & Lazy Loading

### 2.1 Lazy Load Routes

**Update App.jsx**:

```javascript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoadingSpinner from './shared/components/LoadingSpinner';

// Lazy load major sections
const UserRoutes = lazy(() => import('./features/user/UserRoutes'));
const OrganizerRoutes = lazy(() => import('./features/organizer/OrganizerRoutes'));
const AdminRoutes = lazy(() => import('./features/admin/AdminRoutes'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/*" element={<UserRoutes />} />
          <Route path="/organizer/*" element={<OrganizerRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### 2.2 Create Route Files

**Create**: `src/features/user/UserRoutes.jsx`
```javascript
import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
// ... other pages

export default function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/events/:id" element={<EventDetail />} />
      <Route path="/checkout" element={<Checkout />} />
      {/* ... other routes */}
    </Routes>
  );
}
```

**Repeat for**:
- `src/features/organizer/OrganizerRoutes.jsx`
- `src/features/admin/AdminRoutes.jsx`

### 2.3 Dynamic Imports for Large Components

```javascript
// For heavy components (charts, rich editors, etc.)
const ApexChart = lazy(() => import('react-apexcharts'));

<Suspense fallback={<Spin />}>
  <ApexChart {...props} />
</Suspense>
```

---

## 🎯 TASK 3: React Optimization

### 3.1 React.memo for List Items

**EventCard.jsx** (example):

```javascript
import React, { memo } from 'react';

const EventCard = memo(({ event, onFavorite }) => {
  return (
    // ... existing card JSX
  );
}, (prevProps, nextProps) => {
  // Only re-render if event or favorite status changed
  return prevProps.event.event_id === nextProps.event.event_id &&
         prevProps.event.is_favorited === nextProps.event.is_favorited;
});

export default EventCard;
```

**Apply to**:
- EventCard
- OrderCard
- TicketCard
- Any component used in lists

### 3.2 useMemo for Expensive Calculations

```javascript
import { useMemo } from 'react';

const EventList = ({ events }) => {
  // Expensive filtering/sorting
  const filteredEvents = useMemo(() => {
    return events
      .filter(e => e.status === 'APPROVED')
      .sort((a, b) => new Date(b.start_datetime) - new Date(a.start_datetime));
  }, [events]);

  return <div>{/* render filteredEvents */}</div>;
};
```

### 3.3 useCallback for Event Handlers

```javascript
import { useCallback } from 'react';

const EventList = ({ onEventClick }) => {
  const handleClick = useCallback((eventId) => {
    onEventClick(eventId);
  }, [onEventClick]);

  return <EventCard onClick={handleClick} />;
};
```

### 3.4 Virtual Scrolling for Long Lists

**Install**:
```bash
npm install react-window
```

**Example**:
```javascript
import { FixedSizeList } from 'react-window';

const EventList = ({ events }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <EventCard event={events[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={events.length}
      itemSize={250}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
};
```

---

## 🎯 TASK 4: Image Optimization

### 4.1 Lazy Load Images

**Install**:
```bash
npm install react-lazy-load-image-component
```

**Usage**:
```javascript
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

<LazyLoadImage
  src={event.banner_url}
  alt={event.event_name}
  effect="blur"
  placeholderSrc="/placeholder.jpg"
/>
```

### 4.2 Image Component with Placeholder

**Create**: `src/components/OptimizedImage.jsx`

```javascript
import { LazyLoadImage } from 'react-lazy-load-image-component';

const OptimizedImage = ({ src, alt, width, height, className }) => {
  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      effect="blur"
      placeholderSrc="/loading.gif"
      onError={(e) => {
        e.target.src = '/placeholder.jpg'; // Fallback image
      }}
    />
  );
};

export default OptimizedImage;
```

### 4.3 Use in Components

```javascript
// Replace all <img> tags with OptimizedImage
<OptimizedImage
  src={event.banner_url}
  alt={event.event_name}
  className="event-banner"
/>
```

---

## 📊 EXPECTED IMPROVEMENTS

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Bundle Size | 2MB | <1MB | -50% |
| Initial Load | 3s | <1.5s | -50% |
| Re-renders | High | Low | -60% |
| Image Load | Slow | Fast | -40% |
| Memory Usage | High | Medium | -30% |

---

## ✅ OPTIMIZATION CHECKLIST

**Bundle Size**:
- [ ] Removed Material-UI
- [ ] Removed React-Bootstrap
- [ ] Removed unused dependencies
- [ ] Code splitting enabled
- [ ] Lazy loading implemented

**Performance**:
- [ ] React.memo on list components
- [ ] useMemo for calculations
- [ ] useCallback for handlers
- [ ] Virtual scrolling (optional)
- [ ] Image lazy loading

**Code Quality**:
- [ ] No console warnings
- [ ] No unnecessary re-renders
- [ ] Proper key props on lists
- [ ] Error boundaries in place

---

## 🚀 EXECUTION PLAN

### Week 1:
**Day 1-2**: Remove unused libraries
- Uninstall packages
- Replace MUI with Ant Design
- Test all pages

**Day 3**: Code splitting
- Implement lazy loading
- Create route files
- Test navigation

**Day 4**: React optimization
- Add React.memo
- Add useMemo/useCallback
- Measure performance

**Day 5**: Image optimization
- Implement lazy loading
- Add placeholders
- Test on slow network

---

## 🧪 TESTING

### Performance Testing:

1. **Lighthouse Audit**:
```bash
# Chrome DevTools > Lighthouse > Run Audit
```

**Target Scores**:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

2. **Bundle Analysis**:
```bash
npm install --save-dev vite-plugin-visualizer

# Add to vite.config.js
import { visualizer } from 'vite-plugin-visualizer';

plugins: [
  react(),
  visualizer({ open: true })
]

# Build and analyze
npm run build
```

3. **Network Throttling**:
- Chrome DevTools > Network > Slow 3G
- Test loading times
- Verify lazy loading works

---

## 📝 NOTES

### Priority:
1. **HIGH**: Remove unused libraries (easy win)
2. **MEDIUM**: Code splitting (moderate effort)
3. **LOW**: React optimization (case by case)
4. **LOW**: Image optimization (nice to have)

### Breaking Changes:
- Material-UI components need to be replaced
- May need to update component styles
- Test thoroughly after changes

### Backward Compatibility:
- Keep old imports working during migration
- Gradual rollout recommended
- Monitor for errors

---

## 🎯 SUCCESS CRITERIA

**Completed when**:
- ✅ Bundle size < 1MB
- ✅ Initial load < 1.5s
- ✅ Lighthouse score > 90
- ✅ No Material-UI imports
- ✅ All routes lazy loaded
- ✅ Images lazy loaded
- ✅ No console errors

---

**Status**: **GUIDE READY**  
**Next**: Start with Task 1 (remove unused libraries)  
**Estimated Completion**: 1 week

**Let's optimize! ⚡**
