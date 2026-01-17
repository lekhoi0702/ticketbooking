# TicketBooking System - Implementation Checklist
## Session Date: 2026-01-17

---

## ✅ COMPLETED IMPLEMENTATIONS

### 1. Database Schema Updates
- [x] OrganizerInfo table: Added contact_phone, social_facebook, social_instagram, tax_code, bank_account
- [x] Venue table: seat_map_template populated for all 17 venues
- [x] Event table: Cleaned event names (removed numeric suffixes)
- [x] Banner table: 3 new professional banners

### 2. Data Population
- [x] 5 Organizers with complete profiles
- [x] 17 Venues with realistic seat map templates
- [x] 50+ Events with cleaned names
- [x] 3 Professional SVG banners
- [x] 5 Organizer logos (SVG format)

### 3. Admin Panel Improvements
- [x] Categories: Removed ID column
- [x] Events: Removed "Hành động" column from detail modal
- [x] Users: Added role filter (Admin/Organizer/Customer)
- [x] Profile: White background, black text theme

### 4. Organizer Panel Improvements
- [x] Venues: Hide "SẴN SÀNG" badge when status is "BẢO TRÌ"
- [x] Venue ownership: Filter by manager_id

### 5. User Interface Updates
- [x] Search bar: Neutral gray border (not green)
- [x] Header: Consistent theming
- [x] Footer: White background
- [x] Image URLs: Fixed handling for external and local paths

---

## 📋 PENDING TASKS

### HIGH PRIORITY

#### 1. Organizer Profile Management
**Requirement**: Organizers can edit their own information

**Needed**:
- [ ] Create OrganizerProfile page/component
- [ ] Form with fields:
  - Organization name
  - Description
  - Logo upload
  - Website
  - Address
  - Contact phone
  - Social media links
  - Tax code
  - Bank account
  - **NEW**: Bank QR code upload
- [ ] API endpoint: PUT /organizer/profile
- [ ] File upload for logo and QR code

**Files to Create/Modify**:
- `ticketbookingwebapp/src/features/organizer/pages/Profile.jsx`
- `ticketbookingapi/app/routes/organizer.py` (add update_profile endpoint)
- Add `bank_qr_code` column to OrganizerInfo model

---

#### 2. Order Data Seeding
**Status**: Script created but needs verification

**Action**:
- [ ] Debug seed_order_data.py script
- [ ] Verify Order, Ticket, Payment tables populated
- [ ] Create 30+ sample orders with various statuses

**Script**: `seed_order_data.py`

---

#### 3. Banner Display Fix
**Issue**: SVG banners not showing in admin and homepage

**Debugging Steps**:
- [ ] Check Flask SVG MIME type configuration
- [ ] Verify file paths in database
- [ ] Add cache-busting query parameters
- [ ] Test with browser dev tools

**Possible Solutions**:
```python
# In Flask app
@app.after_request
def add_header(response):
    if request.path.endswith('.svg'):
        response.headers['Content-Type'] = 'image/svg+xml'
    return response
```

---

### MEDIUM PRIORITY

#### 4. Loading Component Standardization
**Requirement**: Use single loading component across organizer pages

**Action**:
- [ ] Audit all organizer pages for loading states
- [ ] Replace with consistent component (e.g., `<Spin>` from Ant Design)
- [ ] Remove custom loading implementations

**Files to Check**:
- `organizer/pages/*.jsx`
- `organizer/components/*.jsx`

---

#### 5. Search UI Enhancement
**Requirement**: Search input and button on same row, Enter key support

**Changes Needed**:
```jsx
<Input.Search
  placeholder="Tìm kiếm..."
  onSearch={handleSearch}
  enterButton="Tìm kiếm"
  size="large"
/>
```

**Files to Modify**:
- Admin search components
- User search components

---

#### 6. Seat Map Centering
**Requirement**: Center seat map display in admin event detail

**CSS Fix**:
```css
.seats-map-interaction-area {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

---

## 🗂️ NEW FEATURES TO IMPLEMENT

### Bank QR Code Upload for Organizers

**Database Schema**:
```sql
ALTER TABLE OrganizerInfo ADD COLUMN bank_qr_code VARCHAR(500);
```

**Model Update** (`organizer_info.py`):
```python
bank_qr_code = db.Column(db.String(500), nullable=True)
```

**Upload Endpoint** (`organizer.py`):
```python
@organizer_bp.route('/profile/qr-code', methods=['POST'])
def upload_qr_code():
    # Handle file upload
    # Save to uploads/organizer/qr/
    # Update database
```

**Frontend Component**:
```jsx
<Upload
  name="qr_code"
  listType="picture-card"
  maxCount={1}
  onChange={handleQRUpload}
>
  <div>
    <PlusOutlined />
    <div>Upload QR Code</div>
  </div>
</Upload>
```

---

## 📊 SCRIPTS CREATED

### Data Seeding Scripts
1. ✅ `seed_venue_seat_maps.py` - Venue seat templates
2. ✅ `generate_banner_images.py` - SVG banners
3. ✅ `generate_organizer_logos.py` - Organizer logos
4. ✅ `update_organizer_full_info.py` - Organizer data
5. ✅ `clean_event_names.py` - Event name cleanup
6. ⏳ `seed_order_data.py` - Order/Ticket/Payment data

### Migration Scripts
1. ✅ `migrate_organizer_info.py` - Add new columns

---

## 🎯 NEXT SESSION PRIORITIES

1. **Organizer Profile Edit Page**
   - Create UI component
   - Implement API endpoint
   - Add QR code upload

2. **Fix Banner Display**
   - Debug SVG serving
   - Add cache-busting
   - Verify in browser

3. **Verify Order Data**
   - Debug seeding script
   - Check database

4. **Standardize Loading**
   - Audit organizer pages
   - Replace inconsistent loaders

5. **Search UI Polish**
   - Horizontal layout
   - Enter key support

---

## 📝 NOTES

- All SVG files created to avoid PIL dependency
- Direct pymysql used for seeding (no Flask context needed)
- Database: Aiven MySQL cloud
- Image paths: `uploads/` served by Flask

---

**Session End**: 2026-01-17 14:56:00
**Completion**: ~75% of requested features
**Remaining**: 5-6 medium tasks
