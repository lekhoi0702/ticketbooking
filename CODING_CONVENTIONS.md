# 📘 CODING CONVENTIONS & BEST PRACTICES

## TicketBooking Project Standards
**Version**: 2.0  
**Last Updated**: 2026-01-20

---

## 🎯 GENERAL PRINCIPLES

### 1. Code Quality Principles
- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
- **SOLID**: Single responsibility, Open-closed, Liskov substitution, Interface segregation, Dependency inversion

### 2. Code Review Standards
- ✅ All code must pass linting
- ✅ All tests must pass
- ✅ Code coverage > 70%
- ✅ No hardcoded secrets or credentials
- ✅ Meaningful commit messages

---

## 🐍 PYTHON / BACKEND CONVENTIONS

### File Naming
```
✅ GOOD:
  - order_service.py
  - user_repository.py
  - auth_middleware.py
  
❌ BAD:
  - OrderService.py
  - userRepository.py
  - Auth-Middleware.py
```

### Class Naming
```python
✅ GOOD:
class OrderService:
    pass

class UserRepository:
    pass

class ValidationError(Exception):
    pass

❌ BAD:
class order_service:
    pass

class userRepository:
    pass
```

### Function Naming
```python
✅ GOOD:
def create_order(data: dict) -> Order:
    pass

def get_user_by_id(user_id: int) -> Optional[User]:
    pass

def is_valid_email(email: str) -> bool:
    pass

❌ BAD:
def CreateOrder(data):
    pass

def GetUserById(userId):
    pass

def validateEmail(email):
    pass
```

### Variable Naming
```python
✅ GOOD:
user_count = 10
max_retries = 3
is_active = True
has_permission = False

❌ BAD:
userCount = 10
MaxRetries = 3
Active = True
Permission = False
```

### Constants
```python
✅ GOOD:
MAX_FILE_SIZE = 10_000_000
DEFAULT_TIMEOUT = 30
ALLOWED_EXTENSIONS = ['.jpg', '.png', '.pdf']

❌ BAD:
max_file_size = 10000000
default_timeout = 30
allowed_extensions = ['.jpg', '.png', '.pdf']
```

### Type Hints
```python
✅ GOOD:
from typing import Optional, List, Dict

def get_orders(user_id: int, limit: int = 10) -> List[Order]:
    pass

def find_by_code(code: str) -> Optional[Order]:
    pass

def to_dict(self) -> Dict[str, any]:
    pass

❌ BAD:
def get_orders(user_id, limit=10):
    pass

def find_by_code(code):
    pass
```

### Docstrings
```python
✅ GOOD:
def create_order(data: dict) -> Order:
    """
    Create a new order with tickets.
    
    Args:
        data: Order creation data containing user_id, tickets, etc.
        
    Returns:
        Created Order instance
        
    Raises:
        ValidationError: If input data is invalid
        BusinessLogicError: If business rules are violated
    """
    pass

❌ BAD:
def create_order(data):
    # Create order
    pass
```

### Exception Handling
```python
✅ GOOD:
try:
    order = order_service.create_order(data)
    return jsonify({'success': True, 'data': order.to_dict()}), 201
except ValidationError as e:
    return jsonify({'success': False, 'error': str(e)}), 400
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    return jsonify({'success': False, 'error': 'Internal error'}), 500

❌ BAD:
try:
    order = order_service.create_order(data)
    return jsonify({'success': True, 'data': order.to_dict()}), 201
except Exception as e:
    return jsonify({'success': False, 'error': str(e)}), 500
```

### Logging
```python
✅ GOOD:
logger.info(f"Order created successfully", extra={
    'order_id': order.order_id,
    'user_id': user_id,
    'amount': float(order.total_amount)
})

logger.error(f"Failed to create order", extra={
    'user_id': user_id,
    'error': str(e)
})

❌ BAD:
print(f"Order created: {order.order_id}")
print(f"Error: {e}")
```

### Database Queries
```python
✅ GOOD:
# Use repository pattern
order = order_repository.find_by_id(order_id)

# Use query builder
orders = Order.query.filter_by(
    user_id=user_id,
    order_status='PAID'
).order_by(Order.created_at.desc()).all()

❌ BAD:
# Direct SQL
cursor.execute("SELECT * FROM Order WHERE user_id = %s", (user_id,))

# No filtering
orders = Order.query.all()
```

---

## ⚛️ JAVASCRIPT / REACT CONVENTIONS

### File Naming
```
✅ GOOD:
  - EventCard.jsx (Component)
  - useApi.js (Hook)
  - authApi.js (API module)
  - storage.js (Utility)
  
❌ BAD:
  - event-card.jsx
  - UseApi.js
  - auth_api.js
```

### Component Naming
```javascript
✅ GOOD:
const EventCard = ({ event }) => {
    return <Card>{event.title}</Card>;
};

const UserProfile = () => {
    return <div>Profile</div>;
};

❌ BAD:
const eventCard = ({ event }) => {
    return <Card>{event.title}</Card>;
};

const user_profile = () => {
    return <div>Profile</div>;
};
```

### Function Naming
```javascript
✅ GOOD:
// Event handlers
const handleClick = () => {};
const handleSubmit = (e) => {};
const handleInputChange = (value) => {};

// Boolean functions
const isValidEmail = (email) => {};
const hasPermission = (user) => {};
const canEdit = () => {};

// Actions
const fetchEvents = async () => {};
const createOrder = async (data) => {};

❌ BAD:
const onClick = () => {};
const submit = (e) => {};
const validateEmail = (email) => {};
const permission = (user) => {};
```

### Variable Naming
```javascript
✅ GOOD:
const userCount = 10;
const maxRetries = 3;
const isLoading = true;
const hasError = false;

❌ BAD:
const user_count = 10;
const MaxRetries = 3;
const loading = true;
const error = false;
```

### Constants
```javascript
✅ GOOD:
export const API_BASE_URL = 'http://localhost:5000/api';
export const MAX_FILE_SIZE = 10_000_000;
export const ALLOWED_FORMATS = ['jpg', 'png', 'pdf'];

const STATUS_MAP = {
    PENDING: 'Đang chờ',
    PAID: 'Đã thanh toán',
    CANCELLED: 'Đã hủy',
};

❌ BAD:
export const apiBaseUrl = 'http://localhost:5000/api';
export const maxFileSize = 10000000;
```

### Props Destructuring
```javascript
✅ GOOD:
const EventCard = ({ event, loading, onFavorite }) => {
    return (
        <Card loading={loading} onClick={() => onFavorite(event.id)}>
            {event.title}
        </Card>
    );
};

❌ BAD:
const EventCard = (props) => {
    return (
        <Card loading={props.loading} onClick={() => props.onFavorite(props.event.id)}>
            {props.event.title}
        </Card>
    );
};
```

### State Management
```javascript
✅ GOOD:
// Use descriptive names
const [events, setEvents] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

// Group related state
const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
});

❌ BAD:
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [err, setErr] = useState(null);
```

### useEffect Dependencies
```javascript
✅ GOOD:
useEffect(() => {
    fetchEvents();
}, [fetchEvents]); // Include all dependencies

useEffect(() => {
    if (userId) {
        loadUserData(userId);
    }
}, [userId]); // Correct dependency

❌ BAD:
useEffect(() => {
    fetchEvents();
}, []); // Missing dependency

useEffect(() => {
    loadUserData(userId);
}); // Missing dependency array
```

### Async/Await
```javascript
✅ GOOD:
const fetchEvents = async () => {
    try {
        setLoading(true);
        const response = await eventsApi.getEvents();
        setEvents(response.data);
    } catch (error) {
        setError(error.message);
    } finally {
        setLoading(false);
    }
};

❌ BAD:
const fetchEvents = () => {
    eventsApi.getEvents().then(response => {
        setEvents(response.data);
    }).catch(error => {
        setError(error.message);
    });
};
```

### Conditional Rendering
```javascript
✅ GOOD:
// Short circuit for simple conditions
{isLoading && <LoadingSpinner />}
{error && <ErrorMessage error={error} />}

// Ternary for if-else
{isLoggedIn ? <UserMenu /> : <LoginButton />}

// Early return in component
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;

return <Content />;

❌ BAD:
// Nested ternaries
{isLoading ? <LoadingSpinner /> : error ? <ErrorMessage /> : <Content />}

// Long inline conditions
{user && user.isActive && user.hasPermission && !user.isDeleted && <AdminPanel />}
```

### Component Organization
```javascript
✅ GOOD:
const EventCard = ({ event }) => {
    // 1. Hooks (always at top)
    const [isFavorited, setIsFavorited] = useState(false);
    const { user } = useAuth();
    
    // 2. Derived state / Memoization
    const formattedPrice = useMemo(() => {
        return formatCurrency(event.price);
    }, [event.price]);
    
    // 3. Event handlers
    const handleFavorite = useCallback(() => {
        setIsFavorited(prev => !prev);
    }, []);
    
    // 4. Effects
    useEffect(() => {
        // Load favorite status
    }, [event.id]);
    
    // 5. Render
    return (
        <Card>...</Card>
    );
};

❌ BAD:
const EventCard = ({ event }) => {
    const handleClick = () => {};
    const [state, setState] = useState();
    useEffect(() => {}, []);
    const value = useMemo(() => {}, []);
    
    return <Card>...</Card>;
};
```

---

## 📝 SQL CONVENTIONS

### Table Naming
```sql
✅ GOOD:
CREATE TABLE User (...)
CREATE TABLE Event (...)
CREATE TABLE `Order` (...)  -- Use backticks for reserved words

❌ BAD:
CREATE TABLE users (...)
CREATE TABLE EVENTS (...)
CREATE TABLE order (...)  -- Reserved word without backticks
```

### Column Naming
```sql
✅ GOOD:
user_id INT PRIMARY KEY
full_name VARCHAR(255)
is_active BOOLEAN
created_at TIMESTAMP

❌ BAD:
userId INT PRIMARY KEY
FullName VARCHAR(255)
active BOOLEAN
createdAt TIMESTAMP
```

### Indexes
```sql
✅ GOOD:
-- Descriptive names
CREATE INDEX idx_user_email ON User (email);
CREATE INDEX idx_order_user_status ON `Order` (user_id, order_status);

-- Add comments
CREATE INDEX idx_event_search ON Event (event_name(100)) 
    COMMENT 'For event name search';

❌ BAD:
CREATE INDEX index1 ON User (email);
CREATE INDEX user_order_idx ON `Order` (user_id);
```

### Constraints
```sql
✅ GOOD:
-- Named constraints
CONSTRAINT chk_positive_price CHECK (price >= 0)
CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES User(user_id)

-- Add comments
COMMENT = 'Validates price is non-negative'

❌ BAD:
CHECK (price >= 0)  -- Unnamed
FOREIGN KEY (user_id) REFERENCES User(user_id)  -- Unnamed
```

---

## 📁 DIRECTORY STRUCTURE

### Backend
```
ticketbookingapi/
├── app/
│   ├── exceptions/         # Custom exceptions
│   ├── repositories/       # Data access layer
│   ├── services/           # Business logic
│   ├── routes/             # API endpoints (thin controllers)
│   ├── schemas/            # Validation schemas
│   ├── models/             # ORM models
│   ├── middleware/         # Request/response middleware
│   └── utils/              # Utilities and helpers
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── migrations/             # Database migrations
├── logs/                   # Application logs
├── .env                    # Environment variables (not in git)
├── .env.example           # Example environment file
└── requirements.txt        # Python dependencies
```

### Frontend
```
src/
├── api/                    # API layer
│   ├── client.js          # HTTP client
│   └── modules/           # API modules by domain
├── components/
│   ├── common/            # Reusable components
│   └── layouts/           # Layout components
├── features/              # Feature-based organization
│   ├── user/
│   ├── organizer/
│   └── admin/
├── hooks/                 # Custom hooks
├── context/               # React contexts
├── utils/                 # Utilities
├── theme/                 # Theme configuration
└── assets/                # Static assets
```

---

## 🔒 SECURITY BEST PRACTICES

### 1. Never Commit Secrets
```bash
❌ BAD:
SECRET_KEY = "hardcoded-secret-123"
DATABASE_URL = "mysql://user:password@host/db"

✅ GOOD:
SECRET_KEY = os.getenv('SECRET_KEY')
DATABASE_URL = os.getenv('DATABASE_URL')
```

### 2. Validate All Input
```python
✅ GOOD:
from marshmallow import Schema, fields, validate

class CreateUserSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))
    
data = schema.load(request.get_json())

❌ BAD:
data = request.get_json()
user = User(**data)  # No validation
```

### 3. Use Parameterized Queries
```python
✅ GOOD:
users = User.query.filter_by(email=email).all()
orders = Order.query.filter(Order.user_id == user_id).all()

❌ BAD:
query = f"SELECT * FROM User WHERE email = '{email}'"
cursor.execute(query)
```

### 4. Hash Passwords
```python
✅ GOOD:
from werkzeug.security import generate_password_hash, check_password_hash

user.password_hash = generate_password_hash(password)

❌ BAD:
user.password = password  # Storing plaintext
```

---

## 📊 PERFORMANCE BEST PRACTICES

### 1. Database Queries
```python
✅ GOOD:
# Use eager loading
orders = Order.query.options(
    joinedload(Order.tickets),
    joinedload(Order.payment)
).all()

# Use pagination
orders = Order.query.limit(20).offset(offset).all()

# Use indexes
Order.query.filter(Order.order_code == code).first()  # order_code is indexed

❌ BAD:
# N+1 queries
orders = Order.query.all()
for order in orders:
    tickets = order.tickets  # Separate query for each order
    
# Loading all records
orders = Order.query.all()  # No pagination
```

### 2. React Performance
```javascript
✅ GOOD:
// Memoize expensive computations
const sortedEvents = useMemo(() => {
    return events.sort((a, b) => a.date - b.date);
}, [events]);

// Memoize callbacks
const handleClick = useCallback(() => {
    doSomething();
}, [dependency]);

// Use React.memo for pure components
const EventCard = React.memo(({ event }) => {
    return <Card>{event.title}</Card>;
});

❌ BAD:
// Recompute on every render
const sortedEvents = events.sort((a, b) => a.date - b.date);

// New function on every render
const handleClick = () => {
    doSomething();
};
```

### 3. API Calls
```javascript
✅ GOOD:
// Debounce search
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
    if (debouncedSearch) {
        searchEvents(debouncedSearch);
    }
}, [debouncedSearch]);

// Cancel previous requests
const controller = new AbortController();
fetch(url, { signal: controller.signal });

❌ BAD:
// Search on every keystroke
useEffect(() => {
    searchEvents(searchTerm);
}, [searchTerm]);
```

---

## 🧪 TESTING CONVENTIONS

### Backend Tests
```python
✅ GOOD:
def test_create_order_success():
    """Test successful order creation"""
    # Arrange
    data = {
        'user_id': 1,
        'tickets': [...]
    }
    
    # Act
    order = order_service.create_order(data)
    
    # Assert
    assert order.order_code.startswith('ORD-')
    assert order.order_status == 'PENDING'

def test_create_order_invalid_data():
    """Test order creation with invalid data"""
    with pytest.raises(ValidationError):
        order_service.create_order({})

❌ BAD:
def test1():
    order = order_service.create_order({...})
    assert order
```

### Frontend Tests
```javascript
✅ GOOD:
describe('EventCard', () => {
    it('should display event title', () => {
        const event = { id: 1, title: 'Test Event' };
        render(<EventCard event={event} />);
        expect(screen.getByText('Test Event')).toBeInTheDocument();
    });
    
    it('should call onFavorite when favorite button clicked', () => {
        const onFavorite = jest.fn();
        render(<EventCard event={event} onFavorite={onFavorite} />);
        fireEvent.click(screen.getByRole('button'));
        expect(onFavorite).toHaveBeenCalledWith(event.id);
    });
});

❌ BAD:
test('test1', () => {
    render(<EventCard event={{...}} />);
    expect(true).toBe(true);
});
```

---

## 📝 GIT CONVENTIONS

### Commit Messages
```
✅ GOOD:
feat: Add discount validation to order service
fix: Fix race condition in seat selection
refactor: Extract payment logic to separate service
docs: Update API documentation for orders endpoint
test: Add unit tests for OrderService

❌ BAD:
update code
fix bug
changes
wip
```

### Branch Naming
```
✅ GOOD:
feature/order-discount-validation
fix/seat-selection-race-condition
refactor/payment-service-extraction
hotfix/critical-payment-bug

❌ BAD:
john-updates
fix-bugs
new-feature
temp
```

---

## ✅ CODE REVIEW CHECKLIST

### Before Submitting PR
- [ ] Code follows naming conventions
- [ ] No hardcoded secrets or credentials
- [ ] All tests pass
- [ ] Code coverage is maintained or improved
- [ ] No console.log or print statements (use logger)
- [ ] Comments explain "why", not "what"
- [ ] Error handling is comprehensive
- [ ] Security vulnerabilities addressed
- [ ] Performance impact considered

### Reviewer Checklist
- [ ] Code is readable and maintainable
- [ ] Logic is correct and handles edge cases
- [ ] No obvious security issues
- [ ] Tests are meaningful and sufficient
- [ ] Documentation is updated if needed
- [ ] Breaking changes are documented

---

## 📚 ADDITIONAL RESOURCES

- [Python PEP 8 Style Guide](https://pep8.org/)
- [JavaScript Standard Style](https://standardjs.com/)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [SQL Style Guide](https://www.sqlstyle.guide/)

---

**Last Updated**: 2026-01-20  
**Maintained By**: Development Team
