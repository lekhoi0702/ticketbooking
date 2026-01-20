# 🏗️ REFACTORING ASSESSMENT & STRATEGY
**Project**: TicketBooking System  
**Date**: 2026-01-20  
**Architect**: Senior Software Architect + Tech Lead

---

## 📊 EXECUTIVE SUMMARY

### Current Architecture
- **Backend**: Flask monolith với Service Layer pattern (partial)
- **Frontend**: React 19 + Component-based architecture
- **Database**: TiDB Cloud (MySQL-compatible) với 13 tables
- **Overall Health**: 🟡 **Moderate** - Functional but needs improvement

### Critical Issues Found
1. ❌ **Backend**: Inconsistent transaction management, hardcoded secrets
2. ❌ **Frontend**: Duplicate API logic, no error handling interceptor
3. ❌ **Database**: Missing indexes, inconsistent naming, no audit trails
4. ❌ **General**: No validation layer, no DTO pattern, weak error handling

### Refactoring Strategy
```
Phase 1: Quick Wins (1-2 days)
Phase 2: Structural Changes (3-5 days) 
Phase 3: Advanced Improvements (5-7 days)
```

---

## 🔍 PART 1: BACKEND ANALYSIS

### 1.1 Current Architecture Assessment

#### ✅ **Strengths**
- Service layer tách biệt (OrderService, EventService, etc.)
- SQLAlchemy ORM sử dụng tốt
- Blueprint organization rõ ràng
- SocketIO implementation clean

#### ❌ **Critical Issues**

##### **ISSUE #1: Hardcoded Secrets**
**File**: `ticketbookingapi/app/routes/payments.py`
```python
# Lines 15-16
VNPAY_TMN_CODE = "53A85ZOT"  
VNPAY_HASH_SECRET = "4QL0OQ8BXVB0SLF5KK7Y42AXDPJNOJ37"
```
**Risk**: 🔴 **CRITICAL** - Security vulnerability  
**Impact**: Credentials exposed in source code

**Solution**:
```python
# config.py
class Config:
    VNPAY_TMN_CODE = os.getenv('VNPAY_TMN_CODE')
    VNPAY_HASH_SECRET = os.getenv('VNPAY_HASH_SECRET')
```

---

##### **ISSUE #2: Inconsistent Transaction Management**
**File**: `ticketbookingapi/app/routes/orders.py`
```python
# Lines 80 - Manual commit in controller
db.session.commit()
```
**Problem**: Service không commit, controller phải commit  
**Risk**: 🟡 **MEDIUM** - Inconsistent, error-prone

**Current Flow**:
```
Controller → Service (modify data) → Controller (commit)
```

**Better Flow**:
```
Controller → Service (modify + commit) → Return result
```

**Solution**: Move commit vào service layer

---

##### **ISSUE #3: No DTO/Schema Validation**
**File**: `ticketbookingapi/app/routes/orders.py`
```python
# Line 12 - Direct dict usage
data = request.get_json()
```
**Problem**: Không validate input trước khi xử lý  
**Risk**: 🟡 **MEDIUM** - Invalid data can reach database

**Solution**: Sử dụng Marshmallow schemas
```python
from marshmallow import Schema, fields, validate

class CreateOrderSchema(Schema):
    user_id = fields.Int(required=True)
    customer_name = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    customer_email = fields.Email(required=True)
    tickets = fields.List(fields.Dict(), required=True, validate=validate.Length(min=1))
```

---

##### **ISSUE #4: Generic Exception Handling**
**File**: `ticketbookingapi/app/routes/orders.py`
```python
# Lines 27-30
except ValueError as e:
    db.session.rollback()
    return jsonify({'success': False, 'message': str(e)}), 400
except Exception as e:
    db.session.rollback()
    return jsonify({'success': False, 'message': str(e)}), 500
```
**Problem**: Catch-all exception exposes internal errors  
**Risk**: 🟡 **MEDIUM** - Information leakage

**Solution**: Custom exception hierarchy
```python
# app/exceptions.py
class AppException(Exception):
    status_code = 500
    
class ValidationError(AppException):
    status_code = 400
    
class NotFoundError(AppException):
    status_code = 404

# Global error handler
@app.errorhandler(AppException)
def handle_app_exception(error):
    return jsonify({
        'success': False,
        'error': error.__class__.__name__,
        'message': str(error)
    }), error.status_code
```

---

##### **ISSUE #5: No Repository Pattern**
**Current**: Service directly uses ORM
```python
# order_service.py
order = Order.query.get(order_id)
```

**Problem**: 
- Service coupled với ORM implementation
- Khó test (mock ORM phức tạp)
- Không thể switch database dễ dàng

**Solution**: Repository Pattern
```python
# app/repositories/order_repository.py
class OrderRepository:
    @staticmethod
    def find_by_id(order_id: int) -> Optional[Order]:
        return Order.query.get(order_id)
    
    @staticmethod
    def find_by_code(order_code: str) -> Optional[Order]:
        return Order.query.filter_by(order_code=order_code).first()
    
    @staticmethod
    def save(order: Order) -> Order:
        db.session.add(order)
        db.session.flush()
        return order
    
    @staticmethod
    def delete(order: Order) -> None:
        db.session.delete(order)

# order_service.py
class OrderService:
    def __init__(self, order_repo: OrderRepository = None):
        self.order_repo = order_repo or OrderRepository()
    
    def get_order(self, order_id: int) -> dict:
        order = self.order_repo.find_by_id(order_id)
        if not order:
            raise NotFoundError("Order not found")
        return order.to_dict()
```

---

##### **ISSUE #6: Missing Logging**
**Current**: Chỉ có `print()` statements
```python
# payments.py line 388
print(f"VNPay Return: Code={payment_code}, Response={response_code}")
```

**Problem**: Không có structured logging, khó debug production

**Solution**: Python logging module
```python
import logging

logger = logging.getLogger(__name__)

# In function
logger.info(f"VNPay Return", extra={
    'payment_code': payment_code,
    'response_code': response_code,
    'transaction_no': transaction_no
})
```

---

##### **ISSUE #7: No Rate Limiting**
**Risk**: 🔴 **HIGH** - API abuse, DDoS attacks

**Solution**: Flask-Limiter
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@orders_bp.route("/orders/create", methods=["POST"])
@limiter.limit("10 per minute")
def create_order():
    ...
```

---

### 1.2 Proposed Backend Structure

```
ticketbookingapi/
├── app/
│   ├── __init__.py
│   ├── config.py (✅ exists)
│   ├── extensions.py (✅ exists)
│   │
│   ├── exceptions/          # ❌ NEW
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── validation.py
│   │   └── business.py
│   │
│   ├── dto/                 # ❌ NEW - Data Transfer Objects
│   │   ├── __init__.py
│   │   ├── request/
│   │   │   ├── order_request.py
│   │   │   └── payment_request.py
│   │   └── response/
│   │       ├── order_response.py
│   │       └── event_response.py
│   │
│   ├── schemas/             # ❌ NEW - Marshmallow validation
│   │   ├── __init__.py
│   │   ├── order_schema.py
│   │   └── event_schema.py
│   │
│   ├── repositories/        # ❌ NEW
│   │   ├── __init__.py
│   │   ├── base_repository.py
│   │   ├── order_repository.py
│   │   ├── event_repository.py
│   │   └── user_repository.py
│   │
│   ├── services/ (✅ exists but needs refactor)
│   │   ├── __init__.py
│   │   ├── order_service.py      # ✏️ REFACTOR
│   │   ├── event_service.py      # ✏️ REFACTOR
│   │   └── payment_service.py    # ❌ NEW (extract from routes)
│   │
│   ├── routes/ (✅ exists)
│   │   └── ... # Keep thin, delegate to services
│   │
│   ├── middleware/          # ❌ NEW
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── logging.py
│   │
│   └── utils/ (✅ exists)
│       ├── validators.py    # ❌ NEW
│       └── decorators.py    # ❌ NEW (@transactional, @authorize)
│
└── tests/                   # ❌ EXPAND
    ├── unit/
    ├── integration/
    └── fixtures/
```

---

### 1.3 Backend Refactoring Checklist

#### Phase 1: Quick Wins (1-2 days)
- [ ] Move secrets to environment variables
- [ ] Add structured logging
- [ ] Create custom exception classes
- [ ] Add global error handler
- [ ] Add input validation schemas

#### Phase 2: Structural (3-5 days)
- [ ] Implement Repository pattern
- [ ] Move business logic from controllers to services
- [ ] Consistent transaction management
- [ ] Create DTO classes
- [ ] Add unit tests for services

#### Phase 3: Advanced (5-7 days)
- [ ] Add rate limiting
- [ ] Implement caching (Redis)
- [ ] Add API versioning
- [ ] Add request/response logging middleware
- [ ] Add health check endpoints

---

## 🔍 PART 2: FRONTEND ANALYSIS

### 2.1 Current Architecture Assessment

#### ✅ **Strengths**
- React 19 với modern features
- Component-based architecture
- Context API cho global state
- Custom hooks cho reusable logic
- Route-based code splitting potential

#### ❌ **Critical Issues**

##### **ISSUE #1: Duplicate API Calls Logic**
**Files**: `auth.js`, `event.js`, etc.
```javascript
// Repeated in every API file
const response = await fetch(`${API_BASE_URL}/...`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
});
if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '...');
}
return await response.json();
```

**Problem**: 
- 🔴 **DRY violation** - Same code repeated 50+ times
- No centralized error handling
- No auth token injection
- No response interceptor

**Solution**: API Client với interceptors
```javascript
// src/services/apiClient.js
class ApiClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.requestInterceptors = [];
        this.responseInterceptors = [];
    }
    
    addRequestInterceptor(fn) {
        this.requestInterceptors.push(fn);
    }
    
    addResponseInterceptor(fn) {
        this.responseInterceptors.push(fn);
    }
    
    async request(endpoint, options = {}) {
        let url = `${this.baseURL}${endpoint}`;
        let config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        
        // Apply request interceptors
        for (const interceptor of this.requestInterceptors) {
            config = await interceptor(config);
        }
        
        let response = await fetch(url, config);
        
        // Apply response interceptors
        for (const interceptor of this.responseInterceptors) {
            response = await interceptor(response);
        }
        
        return response;
    }
}

// Setup
const apiClient = new ApiClient(API_BASE_URL);

// Auth interceptor
apiClient.addRequestInterceptor((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Error interceptor
apiClient.addResponseInterceptor(async (response) => {
    if (!response.ok) {
        if (response.status === 401) {
            // Redirect to login
            window.location.href = '/login';
        }
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
    }
    return response.json();
});
```

---

##### **ISSUE #2: Props Drilling**
**Example**: EventCard receives event data through multiple levels

**Current**:
```
Home → EventSection → Col → EventCard (prop drilling)
```

**Solution**: Context + Custom hooks
```javascript
// EventContext.jsx
const EventContext = createContext();

export const EventProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const loadEvents = async (filters) => {
        setLoading(true);
        try {
            const data = await api.getEvents(filters);
            setEvents(data);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <EventContext.Provider value={{ events, loading, loadEvents }}>
            {children}
        </EventContext.Provider>
    );
};

export const useEvents = () => useContext(EventContext);
```

---

##### **ISSUE #3: No Error Boundary**
**Problem**: Component error crashes entire app

**Solution**:
```javascript
// ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
    state = { hasError: false, error: null };
    
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    
    componentDidCatch(error, errorInfo) {
        console.error('Error caught:', error, errorInfo);
        // Log to error tracking service
    }
    
    render() {
        if (this.state.hasError) {
            return <ErrorFallback error={this.state.error} />;
        }
        return this.props.children;
    }
}
```

---

##### **ISSUE #4: Inefficient Re-renders**
**File**: `EventCard.jsx`
```jsx
// Every prop change causes re-render
const EventCard = ({ event }) => {
    // No memoization
    return (
        <Card>...</Card>
    );
};
```

**Solution**: React.memo + useMemo
```javascript
const EventCard = React.memo(({ event }) => {
    const formattedPrice = useMemo(() => {
        return formatCurrency(event.price);
    }, [event.price]);
    
    return (
        <Card>...</Card>
    );
}, (prevProps, nextProps) => {
    // Custom comparison
    return prevProps.event.id === nextProps.event.id &&
           prevProps.event.updated_at === nextProps.event.updated_at;
});
```

---

##### **ISSUE #5: localStorage Direct Access**
**Files**: Multiple files accessing `localStorage` directly

**Problem**: 
- Khó test
- Không type-safe
- Duplicate code

**Solution**: Storage abstraction
```javascript
// src/utils/storage.js
class StorageService {
    constructor(storage = localStorage) {
        this.storage = storage;
    }
    
    get(key, defaultValue = null) {
        try {
            const item = this.storage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    }
    
    set(key, value) {
        this.storage.setItem(key, JSON.stringify(value));
    }
    
    remove(key) {
        this.storage.removeItem(key);
    }
    
    clear() {
        this.storage.clear();
    }
}

export const storage = new StorageService();

// Usage
const token = storage.get('token');
storage.set('user', userData);
```

---

### 2.2 Proposed Frontend Structure

```
src/
├── api/                    # ❌ NEW - Centralized API layer
│   ├── client.js          # ApiClient with interceptors
│   ├── endpoints.js       # API endpoint constants
│   └── modules/
│       ├── auth.js
│       ├── events.js
│       └── orders.js
│
├── components/            # ❌ REORGANIZE
│   ├── common/           # Reusable components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── Card/
│   │
│   ├── features/         # Feature-specific components
│   │   ├── Event/
│   │   ├── Order/
│   │   └── Payment/
│   │
│   └── layouts/          # Layout components
│       ├── MainLayout.jsx
│       └── AdminLayout.jsx
│
├── hooks/                # ❌ CONSOLIDATE
│   ├── useApi.js         # Generic API hook
│   ├── useDebounce.js
│   ├── useLocalStorage.js
│   └── useInfiniteScroll.js
│
├── context/              # ✅ EXISTS
│   ├── AuthContext.jsx
│   ├── EventContext.jsx  # ❌ NEW
│   └── CartContext.jsx   # ❌ NEW
│
├── utils/                # ✅ EXISTS - EXPAND
│   ├── storage.js        # ❌ NEW
│   ├── validators.js     # ❌ NEW
│   ├── formatters.js
│   └── constants.js
│
├── types/                # ❌ NEW (if using TypeScript)
│   ├── event.ts
│   ├── order.ts
│   └── user.ts
│
└── features/             # ✅ EXISTS
    ├── user/
    ├── organizer/
    └── admin/
```

---

### 2.3 Frontend Refactoring Checklist

#### Phase 1: Quick Wins (1-2 days)
- [ ] Create ApiClient with interceptors
- [ ] Add ErrorBoundary components
- [ ] Create storage abstraction
- [ ] Add loading states consistently
- [ ] Extract common constants

#### Phase 2: Structural (3-5 days)
- [ ] Refactor API calls to use ApiClient
- [ ] Add React.memo where needed
- [ ] Create reusable component library
- [ ] Implement error handling pattern
- [ ] Add form validation library (Yup/Zod)

#### Phase 3: Advanced (5-7 days)
- [ ] Add React Query for data fetching
- [ ] Implement optimistic updates
- [ ] Add service worker for offline support
- [ ] Implement lazy loading for routes
- [ ] Add performance monitoring

---

## 🔍 PART 3: DATABASE ANALYSIS

### 3.1 Schema Issues

#### ❌ **ISSUE #1: Missing Indexes**

**Problem**: Queries sẽ chậm khi data scale

**Missing Indexes**:
```sql
-- 1. Event search by name (used frequently)
-- Current: Full table scan
SELECT * FROM Event WHERE event_name LIKE '%concert%';

-- 2. Order search by customer email
SELECT * FROM `Order` WHERE customer_email = 'user@example.com';

-- 3. Ticket by holder_email
SELECT * FROM Ticket WHERE holder_email = 'user@example.com';

-- 4. Payment by transaction_id
SELECT * FROM Payment WHERE transaction_id = 'TXN123';

-- 5. Composite index for event filtering
SELECT * FROM Event WHERE status = 'PUBLISHED' AND start_datetime > NOW();
```

**Solution SQL**:
```sql
-- Add missing indexes
ALTER TABLE Event ADD INDEX idx_event_name (event_name(100));
ALTER TABLE Event ADD INDEX idx_status_start (status, start_datetime);
ALTER TABLE `Order` ADD INDEX idx_customer_email (customer_email);
ALTER TABLE Ticket ADD INDEX idx_holder_email (holder_email);
ALTER TABLE Payment ADD INDEX idx_transaction (transaction_id);

-- Composite indexes for common queries
ALTER TABLE Event ADD INDEX idx_published_featured (status, is_featured, start_datetime);
ALTER TABLE `Order` ADD INDEX idx_user_status (user_id, order_status, created_at DESC);
```

---

#### ❌ **ISSUE #2: Inconsistent Naming Convention**

**Problems**:
1. Table names: PascalCase (should be snake_case)
2. Some columns use camelCase, some snake_case
3. ENUM values inconsistent (UPPERCASE vs lowercase)

**Current**:
```sql
Table: `Order` (keyword conflict)
Column: is_active (good)
Column: sold_tickets (good)
ENUM: 'DRAFT', 'PENDING_APPROVAL' (good)
```

**Recommendation**: Keep current (MySQL allows, TiDB compatible)
**But**: Wrap table names in backticks always

---

#### ❌ **ISSUE #3: No Soft Delete Pattern**

**Current**: Hard delete with CASCADE
```sql
CONSTRAINT `Order_ibfk_1` FOREIGN KEY (`user_id`) 
    REFERENCES `User` (`user_id`) 
    ON DELETE RESTRICT
```

**Problem**: Data loss, no audit trail

**Solution**: Add deleted_at columns
```sql
-- Add to critical tables
ALTER TABLE Event ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE `Order` ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE Ticket ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

-- Add index for soft delete queries
ALTER TABLE Event ADD INDEX idx_deleted_at (deleted_at);
ALTER TABLE `Order` ADD INDEX idx_deleted_at (deleted_at);

-- Update queries to filter out deleted records
SELECT * FROM Event WHERE deleted_at IS NULL;
```

---

#### ❌ **ISSUE #4: No Audit Trail**

**Problem**: Không track changes

**Solution**: Create audit tables
```sql
CREATE TABLE AuditLog (
    audit_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_changed_at (changed_at),
    FOREIGN KEY (changed_by) REFERENCES `User`(user_id)
) ENGINE=InnoDB;
```

---

#### ❌ **ISSUE #5: Duplicate Timestamp Columns**

**File**: ticketbookingdb.sql
```sql
-- Payment table has both:
`paid_at` datetime
`payment_date` timestamp

-- Order table has:
`created_at` timestamp
`updated_at` timestamp
`paid_at` timestamp
```

**Problem**: Confusing, redundant

**Recommendation**: Consolidate naming
```sql
-- Standard pattern:
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
deleted_at TIMESTAMP NULL
{action}_at TIMESTAMP NULL -- e.g., paid_at, checked_in_at
```

---

#### ❌ **ISSUE #6: No Database Constraints for Business Rules**

**Examples**:
```sql
-- 1. Event dates validation
-- start_datetime should be < end_datetime
-- No CHECK constraint

-- 2. Ticket quantity validation  
-- sold_quantity should be <= quantity
-- No CHECK constraint

-- 3. Price validation
-- price should be >= 0
-- No CHECK constraint
```

**Solution**:
```sql
-- Add CHECK constraints (TiDB 5.0+)
ALTER TABLE Event ADD CONSTRAINT chk_event_dates 
    CHECK (start_datetime < end_datetime);

ALTER TABLE TicketType ADD CONSTRAINT chk_sold_quantity 
    CHECK (sold_quantity >= 0 AND sold_quantity <= quantity);

ALTER TABLE TicketType ADD CONSTRAINT chk_positive_price 
    CHECK (price >= 0);

ALTER TABLE `Order` ADD CONSTRAINT chk_positive_amounts 
    CHECK (total_amount >= 0 AND final_amount >= 0 AND final_amount <= total_amount);
```

---

### 3.2 Performance Optimizations

#### Optimization #1: Add Covering Indexes
```sql
-- For event list page (common query)
CREATE INDEX idx_event_list_covering ON Event (
    status, 
    start_datetime, 
    is_featured,
    sold_tickets,
    event_id,
    event_name,
    banner_image_url
);

-- For order history (user dashboard)
CREATE INDEX idx_user_orders_covering ON `Order` (
    user_id,
    order_status,
    created_at DESC,
    order_code,
    total_amount,
    final_amount
);
```

#### Optimization #2: Partition Large Tables
```sql
-- Partition orders by year
ALTER TABLE `Order` PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

#### Optimization #3: Add Statistics
```sql
-- Update table statistics for better query planning
ANALYZE TABLE Event;
ANALYZE TABLE `Order`;
ANALYZE TABLE Ticket;
ANALYZE TABLE Payment;
```

---

### 3.3 Database Migration Script

```sql
-- ============================================
-- TICKETBOOKING DATABASE OPTIMIZATION SCRIPT
-- Version: 2.0
-- Date: 2026-01-20
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- PART 1: ADD MISSING INDEXES
-- ============================================

-- Event table optimizations
ALTER TABLE Event ADD INDEX idx_event_name (event_name(100)) 
    COMMENT 'For search by name';

ALTER TABLE Event ADD INDEX idx_status_start (status, start_datetime) 
    COMMENT 'For filtering published/upcoming events';

ALTER TABLE Event ADD INDEX idx_published_featured (status, is_featured, start_datetime) 
    COMMENT 'Covering index for homepage';

-- Order table optimizations
ALTER TABLE `Order` ADD INDEX idx_customer_email (customer_email) 
    COMMENT 'For customer order lookup';

ALTER TABLE `Order` ADD INDEX idx_user_status (user_id, order_status, created_at DESC) 
    COMMENT 'For user order history';

-- Ticket table optimizations
ALTER TABLE Ticket ADD INDEX idx_holder_email (holder_email) 
    COMMENT 'For ticket holder lookup';

ALTER TABLE Ticket ADD INDEX idx_ticket_type_status (ticket_type_id, ticket_status) 
    COMMENT 'For event ticket statistics';

-- Payment table optimizations
ALTER TABLE Payment ADD INDEX idx_transaction (transaction_id) 
    COMMENT 'For payment reconciliation';

ALTER TABLE Payment ADD INDEX idx_payment_status_date (payment_status, paid_at) 
    COMMENT 'For payment reports';

-- ============================================
-- PART 2: ADD SOFT DELETE SUPPORT
-- ============================================

-- Add deleted_at columns
ALTER TABLE Event ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL 
    COMMENT 'Soft delete timestamp';
    
ALTER TABLE `Order` ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL 
    COMMENT 'Soft delete timestamp';
    
ALTER TABLE Ticket ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL 
    COMMENT 'Soft delete timestamp';

-- Add indexes for soft delete
ALTER TABLE Event ADD INDEX idx_deleted_at (deleted_at);
ALTER TABLE `Order` ADD INDEX idx_deleted_at (deleted_at);
ALTER TABLE Ticket ADD INDEX idx_deleted_at (deleted_at);

-- ============================================
-- PART 3: ADD BUSINESS RULE CONSTRAINTS
-- ============================================

-- Event date validation
ALTER TABLE Event ADD CONSTRAINT chk_event_dates 
    CHECK (start_datetime < end_datetime);

ALTER TABLE Event ADD CONSTRAINT chk_event_sales_dates 
    CHECK (sale_start_datetime IS NULL OR sale_end_datetime IS NULL OR sale_start_datetime < sale_end_datetime);

-- Ticket quantity validation
ALTER TABLE TicketType ADD CONSTRAINT chk_ticket_quantity 
    CHECK (sold_quantity >= 0 AND sold_quantity <= quantity);

-- Price validation
ALTER TABLE TicketType ADD CONSTRAINT chk_ticket_price 
    CHECK (price >= 0);

ALTER TABLE Ticket ADD CONSTRAINT chk_ticket_price 
    CHECK (price >= 0);

-- Order amount validation
ALTER TABLE `Order` ADD CONSTRAINT chk_order_amounts 
    CHECK (total_amount >= 0 AND final_amount >= 0 AND final_amount <= total_amount);

ALTER TABLE Payment ADD CONSTRAINT chk_payment_amount 
    CHECK (amount >= 0);

-- ============================================
-- PART 4: CREATE AUDIT LOG TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS AuditLog (
    audit_id BIGINT NOT NULL AUTO_INCREMENT,
    table_name VARCHAR(50) NOT NULL COMMENT 'Audited table name',
    record_id INT NOT NULL COMMENT 'ID of affected record',
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON COMMENT 'Old values before change',
    new_values JSON COMMENT 'New values after change',
    changed_by INT COMMENT 'User ID who made the change',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) COMMENT 'IP address of requester',
    user_agent TEXT COMMENT 'Browser user agent',
    PRIMARY KEY (audit_id),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_changed_at (changed_at),
    INDEX idx_changed_by (changed_by),
    FOREIGN KEY (changed_by) REFERENCES `User`(user_id) ON DELETE SET NULL
) ENGINE=InnoDB 
  CHARACTER SET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='Audit trail for critical operations';

-- ============================================
-- PART 5: ADD PERFORMANCE HINTS
-- ============================================

-- Update statistics
ANALYZE TABLE Event;
ANALYZE TABLE `Order`;
ANALYZE TABLE Ticket;
ANALYZE TABLE TicketType;
ANALYZE TABLE Payment;
ANALYZE TABLE `User`;

-- ============================================
-- PART 6: ADD HELPER VIEWS
-- ============================================

-- View for active events
CREATE OR REPLACE VIEW v_active_events AS
SELECT 
    e.*,
    c.category_name,
    v.venue_name,
    v.city,
    u.full_name as manager_name
FROM Event e
JOIN EventCategory c ON e.category_id = c.category_id
JOIN Venue v ON e.venue_id = v.venue_id
JOIN `User` u ON e.manager_id = u.user_id
WHERE e.deleted_at IS NULL
  AND e.status IN ('PUBLISHED', 'ONGOING');

-- View for order summary
CREATE OR REPLACE VIEW v_order_summary AS
SELECT 
    o.order_id,
    o.order_code,
    o.user_id,
    o.order_status,
    o.total_amount,
    o.final_amount,
    o.created_at,
    COUNT(t.ticket_id) as ticket_count,
    p.payment_status,
    p.payment_method
FROM `Order` o
LEFT JOIN Ticket t ON o.order_id = t.order_id
LEFT JOIN Payment p ON o.order_id = p.order_id
WHERE o.deleted_at IS NULL
GROUP BY o.order_id;

-- ============================================
-- PART 7: ADD STORED PROCEDURES
-- ============================================

DELIMITER $$

-- Procedure to safely delete event with all related data
CREATE PROCEDURE sp_soft_delete_event(
    IN p_event_id INT,
    IN p_deleted_by INT
)
BEGIN
    DECLARE v_now TIMESTAMP;
    SET v_now = CURRENT_TIMESTAMP;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Soft delete event
    UPDATE Event 
    SET deleted_at = v_now 
    WHERE event_id = p_event_id;
    
    -- Log to audit
    INSERT INTO AuditLog (table_name, record_id, action, changed_by)
    VALUES ('Event', p_event_id, 'DELETE', p_deleted_by);
    
    COMMIT;
END$$

-- Procedure to calculate event revenue
CREATE PROCEDURE sp_calculate_event_revenue(
    IN p_event_id INT,
    OUT p_total_revenue DECIMAL(15,2),
    OUT p_ticket_count INT
)
BEGIN
    SELECT 
        COALESCE(SUM(o.final_amount), 0),
        COALESCE(COUNT(t.ticket_id), 0)
    INTO p_total_revenue, p_ticket_count
    FROM Ticket t
    JOIN `Order` o ON t.order_id = o.order_id
    JOIN TicketType tt ON t.ticket_type_id = tt.ticket_type_id
    WHERE tt.event_id = p_event_id
      AND o.order_status = 'PAID'
      AND t.ticket_status != 'CANCELLED';
END$$

DELIMITER ;

-- ============================================
-- PART 8: ADD TRIGGERS
-- ============================================

DELIMITER $$

-- Trigger to auto-update Event.sold_tickets
CREATE TRIGGER trg_ticket_insert_update_sold
AFTER INSERT ON Ticket
FOR EACH ROW
BEGIN
    UPDATE TicketType
    SET sold_quantity = sold_quantity + 1
    WHERE ticket_type_id = NEW.ticket_type_id;
    
    UPDATE Event e
    JOIN TicketType tt ON e.event_id = tt.event_id
    SET e.sold_tickets = e.sold_tickets + 1
    WHERE tt.ticket_type_id = NEW.ticket_type_id;
END$$

-- Trigger to validate ticket status transition
CREATE TRIGGER trg_ticket_status_validate
BEFORE UPDATE ON Ticket
FOR EACH ROW
BEGIN
    -- Prevent invalid status transitions
    IF OLD.ticket_status = 'USED' AND NEW.ticket_status != 'USED' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot change status of used ticket';
    END IF;
END$$

DELIMITER ;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show all indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ticketbookingdb'
  AND TABLE_NAME IN ('Event', 'Order', 'Ticket', 'Payment')
GROUP BY TABLE_NAME, INDEX_NAME
ORDER BY TABLE_NAME, INDEX_NAME;

-- Show constraints
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'ticketbookingdb'
ORDER BY TABLE_NAME, CONSTRAINT_TYPE;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- END OF SCRIPT
-- ============================================
```

---

## 📋 IMPLEMENTATION ROADMAP

### Week 1: Backend Foundations
**Day 1-2**: Setup & Quick Wins
- [ ] Create `.env` file and move secrets
- [ ] Add logging infrastructure
- [ ] Create exception hierarchy
- [ ] Add global error handler

**Day 3-4**: Structure
- [ ] Create repository layer
- [ ] Create DTO/Schema classes
- [ ] Refactor services to use repositories

**Day 5**: Testing
- [ ] Write unit tests for services
- [ ] Integration tests for critical paths

### Week 2: Frontend & Database
**Day 6-7**: Frontend API Layer
- [ ] Create ApiClient with interceptors
- [ ] Refactor all API calls
- [ ] Add ErrorBoundary

**Day 8-9**: Database
- [ ] Run optimization SQL script
- [ ] Test all queries
- [ ] Update ORM models if needed

**Day 10**: Final Integration
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Documentation

---

## 🎯 SUCCESS METRICS

### Before Refactoring
- Code duplication: ~40%
- Test coverage: 0%
- API response time: 200-500ms
- Frontend bundle size: 1.2MB
- Database query time: 50-200ms

### After Refactoring (Target)
- Code duplication: <10%
- Test coverage: >70%
- API response time: <100ms
- Frontend bundle size: <800KB
- Database query time: <50ms

---

## ⚠️ RISKS & MITIGATION

### Risk 1: Breaking Changes
**Mitigation**: 
- Feature flags for new code
- Parallel old/new implementation
- Comprehensive testing

### Risk 2: Performance Regression
**Mitigation**:
- Benchmark before/after
- Load testing
- Monitoring dashboard

### Risk 3: Team Adoption
**Mitigation**:
- Detailed documentation
- Code examples
- Pair programming sessions

---

## 📚 NEXT STEPS

1. **Review this document** with team
2. **Prioritize issues** based on impact
3. **Create Jira tickets** for each task
4. **Start with Phase 1** quick wins
5. **Iterate and improve**

---

**Document Status**: ✅ Complete - Ready for Review
**Last Updated**: 2026-01-20
**Author**: Senior Software Architect
