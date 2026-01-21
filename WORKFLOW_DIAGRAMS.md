# Ticket Booking System - Workflow Diagrams

Tài liệu này mô tả các workflow chính của hệ thống đặt vé sự kiện bằng Mermaid diagrams.

## 1. Authentication Flow (Luồng Xác Thực)

```mermaid
sequenceDiagram
    participant User as Người dùng
    participant Frontend as React Frontend
    participant AuthAPI as /api/auth
    participant DB as Database
    participant JWT as JWT Token

    Note over User,JWT: Đăng ký tài khoản
    User->>Frontend: Điền form đăng ký
    Frontend->>AuthAPI: POST /api/auth/register
    AuthAPI->>DB: Kiểm tra email/phone đã tồn tại?
    alt Email/Phone đã tồn tại
        DB-->>AuthAPI: Email/Phone exists
        AuthAPI-->>Frontend: Error: Email đã tồn tại
        Frontend-->>User: Hiển thị lỗi
    else Email/Phone chưa tồn tại
        AuthAPI->>DB: Tạo User mới (role_id=3: USER)
        DB-->>AuthAPI: User created
        AuthAPI-->>Frontend: Success: Đăng ký thành công
        Frontend-->>User: Chuyển đến trang đăng nhập
    end

    Note over User,JWT: Đăng nhập
    User->>Frontend: Nhập email/phone + password
    Frontend->>AuthAPI: POST /api/auth/login
    AuthAPI->>DB: Tìm user theo email/phone
    alt User không tồn tại hoặc sai mật khẩu
        DB-->>AuthAPI: User not found / Wrong password
        AuthAPI-->>Frontend: Error: Tài khoản hoặc mật khẩu không chính xác
        Frontend-->>User: Hiển thị lỗi
    else Tài khoản bị khóa
        DB-->>AuthAPI: User.is_active = False
        AuthAPI-->>Frontend: Error: Tài khoản đã bị khóa
        Frontend-->>User: Hiển thị thông báo
    else Đăng nhập thành công
        DB-->>AuthAPI: User found & password correct
        AuthAPI->>JWT: Tạo JWT token (user_id, role, exp)
        JWT-->>AuthAPI: Token generated
        AuthAPI-->>Frontend: Success + Token + User data
        Frontend->>Frontend: Lưu token vào localStorage
        Frontend-->>User: Chuyển đến trang chủ/dashboard
    end

    Note over User,JWT: Đổi mật khẩu
    User->>Frontend: Nhập mật khẩu cũ + mới
    Frontend->>AuthAPI: POST /api/auth/change-password
    AuthAPI->>DB: Verify old password
    alt Mật khẩu cũ sai
        DB-->>AuthAPI: Wrong password
        AuthAPI-->>Frontend: Error: Mật khẩu hiện tại không chính xác
    else Đổi mật khẩu thành công
        AuthAPI->>DB: Update password (hash)
        DB-->>AuthAPI: Password updated
        AuthAPI-->>Frontend: Success: Đổi mật khẩu thành công
        Frontend-->>User: Thông báo thành công
    end
```

## 2. Event Booking Flow (Luồng Đặt Vé)

```mermaid
flowchart TD
    Start([Người dùng truy cập trang chủ]) --> Browse[Browse Events]
    Browse --> Filter{Filter Events?}
    Filter -->|Category| Category[Filter by Category]
    Filter -->|Search| Search[Search Events]
    Filter -->|Price Range| Price[Filter by Price]
    Category --> EventList[Hiển thị danh sách Events]
    Search --> EventList
    Price --> EventList
    
    EventList --> SelectEvent[Chọn Event]
    SelectEvent --> EventDetail[Trang Event Detail]
    
    EventDetail --> CheckAuth{Đã đăng nhập?}
    CheckAuth -->|Chưa| Login[Chuyển đến Login]
    Login --> EventDetail
    
    CheckAuth -->|Đã đăng nhập| SelectTickets[Chọn loại vé và số lượng]
    
    SelectTickets --> HasSeatMap{Event có Seat Map?}
    HasSeatMap -->|Có| SelectSeats[Chọn ghế trên Seat Map]
    HasSeatMap -->|Không| NoSeats[Không chọn ghế]
    
    SelectSeats --> SocketConnect[Kết nối Socket.IO]
    SocketConnect --> HoldSeats[Giữ ghế trong 30 phút]
    HoldSeats --> TimerWarning{Còn < 5 phút?}
    TimerWarning -->|Có| ShowWarning[Hiển thị cảnh báo]
    TimerWarning -->|Không| Continue[Tiếp tục]
    ShowWarning --> Continue
    
    NoSeats --> Checkout
    Continue --> Checkout[Trang Checkout]
    
    Checkout --> FillInfo[Điền thông tin khách hàng]
    FillInfo --> ApplyDiscount{Áp dụng mã giảm giá?}
    ApplyDiscount -->|Có| ValidateDiscount[Validate Discount Code]
    ValidateDiscount --> DiscountValid{Mã hợp lệ?}
    DiscountValid -->|Không| DiscountError[Hiển thị lỗi mã]
    DiscountError --> FillInfo
    DiscountValid -->|Có| CalculateTotal[Tính tổng tiền với giảm giá]
    ApplyDiscount -->|Không| CalculateTotal[Tính tổng tiền]
    
    CalculateTotal --> SelectPayment[Chọn phương thức thanh toán]
    SelectPayment --> PaymentMethod{CASH hay VNPAY?}
    
    PaymentMethod -->|CASH| CreateOrderCash[Tạo Order với status PENDING]
    PaymentMethod -->|VNPAY| CreateOrderVNPay[Tạo Order với status PENDING]
    
    CreateOrderCash --> CreatePaymentCash[Tạo Payment record]
    CreatePaymentCash --> OrderCreated[Order created successfully]
    
    CreateOrderVNPay --> CreatePaymentVNPay[Tạo Payment record]
    CreatePaymentVNPay --> CreateVNPayURL[Tạo VNPay Payment URL]
    CreateVNPayURL --> RedirectVNPay[Redirect đến VNPay]
    RedirectVNPay --> VNPayProcess[VNPay xử lý thanh toán]
    VNPayProcess --> VNPayReturn[VNPay return callback]
    VNPayReturn --> VerifyPayment[Verify payment signature]
    VerifyPayment --> PaymentSuccess{Payment thành công?}
    PaymentSuccess -->|Có| UpdateOrderPaid[Cập nhật Order status = PAID]
    PaymentSuccess -->|Không| UpdateOrderCancelled[Cập nhật Order status = CANCELLED]
    
    OrderCreated --> OrderSuccess[Trang Order Success]
    UpdateOrderPaid --> OrderSuccess
    UpdateOrderCancelled --> OrderFailed[Trang Order Failed]
    
    OrderSuccess --> ViewTickets[Xem vé trong Profile]
```

## 3. Order Creation & Payment Flow (Chi Tiết)

```mermaid
sequenceDiagram
    participant User as User
    participant Frontend as Frontend
    participant OrderAPI as /api/orders
    participant PaymentAPI as /api/payments
    participant OrderService as OrderService
    participant PaymentService as PaymentService
    participant DB as Database
    participant VNPay as VNPay Gateway

    User->>Frontend: Submit checkout form
    Frontend->>OrderAPI: POST /api/orders/create
    OrderAPI->>OrderService: create_order(data)
    
    Note over OrderService: Validate tickets & seats
    OrderService->>DB: Check ticket availability
    OrderService->>DB: Check seat status (if applicable)
    
    alt Not enough tickets/seats
        DB-->>OrderService: Insufficient availability
        OrderService-->>OrderAPI: ValueError
        OrderAPI-->>Frontend: Error: Not enough tickets
        Frontend-->>User: Show error message
    else Valid order
        OrderService->>DB: Validate discount code (if provided)
        alt Invalid discount
            DB-->>OrderService: Invalid discount
            OrderService-->>OrderAPI: ValueError
            OrderAPI-->>Frontend: Error: Invalid discount
        else Valid discount
            OrderService->>DB: Calculate total & final amount
            OrderService->>DB: Create Order (status: PENDING)
            OrderService->>DB: Create Tickets
            OrderService->>DB: Update seat status to RESERVED (if applicable)
            OrderService->>DB: Update ticket_type sold_quantity
            OrderService->>DB: Increment discount used_count
            DB-->>OrderService: Order created
            OrderService-->>OrderAPI: Order + Tickets + payment_required
            OrderAPI-->>Frontend: Success: Order created
        end
    end

    Frontend->>PaymentAPI: POST /api/payments/create
    PaymentAPI->>DB: Create Payment record (status: PENDING)
    DB-->>PaymentAPI: Payment created
    PaymentAPI-->>Frontend: Payment record created

    alt Payment Method: VNPAY
        Frontend->>PaymentAPI: POST /api/payments/vnpay/create-url
        PaymentAPI->>DB: Get order & payment
        PaymentAPI->>PaymentAPI: Build VNPay URL with signature
        PaymentAPI-->>Frontend: VNPay payment URL
        Frontend->>VNPay: Redirect to VNPay
        VNPay->>VNPay: Process payment
        VNPay->>PaymentAPI: GET /api/payments/vnpay/return
        PaymentAPI->>PaymentAPI: Verify signature
        alt Payment Success
            PaymentAPI->>DB: Update Payment (status: SUCCESS)
            PaymentAPI->>DB: Update Order (status: PAID)
            PaymentAPI-->>Frontend: Payment verified successfully
            Frontend-->>User: Redirect to Order Success page
        else Payment Failed
            PaymentAPI->>DB: Update Payment (status: FAILED)
            PaymentAPI->>DB: Update Order (status: CANCELLED)
            PaymentAPI->>DB: Release seats & tickets
            PaymentAPI-->>Frontend: Payment failed
            Frontend-->>User: Show error message
        end
    else Payment Method: CASH
        Frontend->>Frontend: Show order confirmation
        Note over Frontend,DB: Admin/Organizer confirms payment later
        Frontend->>PaymentAPI: POST /api/payments/cash/confirm (Admin/Organizer)
        PaymentAPI->>DB: Update Payment (status: SUCCESS)
        PaymentAPI->>DB: Update Order (status: PAID)
        PaymentAPI-->>Frontend: Cash payment confirmed
    end
```

## 4. Organizer Event Management Flow

```mermaid
flowchart TD
    Start([Organizer đăng nhập]) --> Dashboard[Dashboard - Thống kê]
    Dashboard --> EventList[Danh sách Events]
    
    EventList --> CreateEvent[Tạo Event mới]
    EventList --> EditEvent[Sửa Event]
    EventList --> ViewEvent[Xem chi tiết Event]
    EventList --> DuplicateEvent[Duplicate Event - Tạo suất diễn mới]
    
    CreateEvent --> FillEventForm[Điền thông tin Event]
    FillEventForm --> SelectVenue[Chọn Venue]
    SelectVenue --> CreateVenue{Venue chưa có?}
    CreateVenue -->|Có| NewVenue[Tạo Venue mới]
    CreateVenue -->|Không| ContinueEvent[Tiếp tục]
    NewVenue --> ContinueEvent
    
    ContinueEvent --> UploadImage[Upload hình ảnh]
    UploadImage --> CreateTicketTypes[Tạo các loại vé]
    CreateTicketTypes --> SetSeatMap{Có Seat Map?}
    SetSeatMap -->|Có| ConfigureSeats[Cấu hình Seat Map]
    SetSeatMap -->|Không| SubmitEvent[Submit Event]
    ConfigureSeats --> SubmitEvent
    
    SubmitEvent --> SaveEvent[Lưu Event vào DB]
    SaveEvent --> AuditLog[Ghi Audit Log]
    AuditLog --> EventCreated[Event created - Status: DRAFT]
    
    EditEvent --> LoadEvent[Load Event data]
    LoadEvent --> EditForm[Chỉnh sửa thông tin]
    EditForm --> UpdateEvent[Update Event]
    UpdateEvent --> AuditLogUpdate[Ghi Audit Log - Update]
    AuditLogUpdate --> EventUpdated[Event updated]
    
    ViewEvent --> EventDetails[Chi tiết Event]
    EventDetails --> ManageSeats[Quản lý ghế]
    EventDetails --> ManageTickets[Quản lý vé]
    EventDetails --> ViewOrders[Xem đơn hàng]
    EventDetails --> PublishEvent{Publish Event?}
    PublishEvent -->|Có| ChangeStatus[Đổi status = PUBLISHED]
    PublishEvent -->|Không| KeepDraft[Giữ status = DRAFT]
    
    DuplicateEvent --> DuplicateForm[Điền thông tin suất diễn mới]
    DuplicateForm --> DuplicateSave[Lưu Event mới]
    DuplicateSave --> AuditLogDuplicate[Ghi Audit Log - Duplicate]
    AuditLogDuplicate --> EventDuplicated[Suất diễn mới được tạo]
    
    ManageSeats --> SeatMap[Quản lý Seat Map]
    SeatMap --> AddSeats[Thêm/Xóa/Sửa ghế]
    AddSeats --> UpdateSeatStatus[Cập nhật trạng thái ghế]
    
    ManageTickets --> TicketTypes[Quản lý loại vé]
    TicketTypes --> AddTicketType[Thêm loại vé]
    TicketTypes --> EditTicketType[Sửa loại vé]
    TicketTypes --> DeleteTicketType[Xóa loại vé]
    
    ViewOrders --> OrderList[Danh sách đơn hàng]
    OrderList --> OrderDetail[Chi tiết đơn hàng]
    OrderDetail --> ConfirmCashPayment{Xác nhận thanh toán tiền mặt?}
    ConfirmCashPayment -->|Có| UpdatePayment[Cập nhật Payment status]
    ConfirmCashPayment -->|Không| KeepPending[Giữ PENDING]
    
    Dashboard --> ManageVenues[Quản lý Venues]
    Dashboard --> ManageDiscounts[Quản lý Mã giảm giá]
    Dashboard --> ViewStats[Xem thống kê]
    
    ManageDiscounts --> CreateDiscount[Tạo mã giảm giá]
    CreateDiscount --> SetDiscountRules[Thiết lập quy tắc giảm giá]
    SetDiscountRules --> SaveDiscount[Lưu Discount]
    
    ManageVenues --> VenueList[Danh sách Venues]
    VenueList --> CreateVenue[Tạo Venue mới]
    VenueList --> EditVenue[Sửa Venue]
```

## 5. Admin Management Flow

```mermaid
flowchart TD
    Start([Admin đăng nhập]) --> AdminDashboard[Admin Dashboard]
    
    AdminDashboard --> UserManagement[Quản lý Users]
    AdminDashboard --> EventManagement[Quản lý Events]
    AdminDashboard --> OrderManagement[Quản lý Orders]
    AdminDashboard --> CategoryManagement[Quản lý Categories]
    AdminDashboard --> BannerManagement[Quản lý Banners]
    AdminDashboard --> Statistics[Thống kê]
    AdminDashboard --> AuditLogs[Audit Logs]
    
    UserManagement --> UserList[Danh sách Users]
    UserList --> CreateUser[Tạo User mới]
    UserList --> EditUser[Sửa User]
    UserList --> BlockUser[Khóa/Mở khóa User]
    UserList --> ChangeRole[Đổi Role]
    
    CreateUser --> UserForm[Form tạo User]
    UserForm --> SetRole{Chọn Role}
    SetRole -->|ADMIN| AdminRole[Role: ADMIN]
    SetRole -->|ORGANIZER| OrganizerRole[Role: ORGANIZER]
    SetRole -->|USER| UserRole[Role: USER]
    AdminRole --> SaveUser[Lưu User]
    OrganizerRole --> SaveUser
    UserRole --> SaveUser
    
    EventManagement --> EventList[Danh sách Events]
    EventList --> ApproveEvent{Duyệt Event?}
    ApproveEvent -->|Có| Approve[Approve Event]
    ApproveEvent -->|Không| Reject[Reject Event]
    EventList --> EditEvent[Sửa Event]
    EventList --> DeleteEvent[Xóa Event]
    EventList --> ViewEventDetails[Xem chi tiết]
    
    Approve --> UpdateEventStatus[Status = PUBLISHED]
    Reject --> UpdateEventStatusReject[Status = REJECTED]
    
    OrderManagement --> OrderList[Danh sách Orders]
    OrderList --> OrderDetail[Chi tiết Order]
    OrderDetail --> ViewPayment[Xem Payment]
    OrderDetail --> CancelOrder{Hủy Order?}
    CancelOrder -->|Có| ProcessRefund[Xử lý hoàn tiền]
    CancelOrder -->|Không| KeepOrder[Giữ nguyên]
    
    CategoryManagement --> CategoryList[Danh sách Categories]
    CategoryList --> CreateCategory[Tạo Category]
    CategoryList --> EditCategory[Sửa Category]
    CategoryList --> DeleteCategory[Xóa Category]
    
    BannerManagement --> BannerList[Danh sách Banners]
    BannerList --> CreateBanner[Tạo Banner]
    BannerList --> EditBanner[Sửa Banner]
    BannerList --> DeleteBanner[Xóa Banner]
    BannerList --> SetFeatured[Đặt Banner nổi bật]
    
    Statistics --> ViewStats[Xem thống kê]
    ViewStats --> TotalUsers[Tổng số Users]
    ViewStats --> TotalEvents[Tổng số Events]
    ViewStats --> TotalRevenue[Doanh thu tổng]
    ViewStats --> TotalTicketsSold[Tổng vé đã bán]
    
    AuditLogs --> AuditList[Danh sách Audit Logs]
    AuditList --> FilterAudit[Lọc theo User/Table/Action]
    FilterAudit --> ViewAuditDetail[Xem chi tiết thay đổi]
```

## 6. Seat Selection & Real-time Updates Flow

```mermaid
sequenceDiagram
    participant User as User
    participant Frontend as Frontend
    participant SocketIO as Socket.IO Server
    participant SeatAPI as /api/seats
    participant DB as Database
    participant OtherUser as Other Users

    User->>Frontend: Chọn Event có Seat Map
    Frontend->>SeatAPI: GET /api/seats/event/:eventId
    SeatAPI->>DB: Get all seats for event
    DB-->>SeatAPI: Seats data
    SeatAPI-->>Frontend: Seats with status

    Frontend->>SocketIO: Connect to Socket.IO
    Frontend->>SocketIO: Join event room (event_id)
    
    User->>Frontend: Click chọn ghế
    Frontend->>SocketIO: Emit 'select_seat' (seat_id, user_id)
    SocketIO->>DB: Check seat status
    alt Seat available
        DB-->>SocketIO: Seat is AVAILABLE
        SocketIO->>DB: Update seat status = RESERVED
        SocketIO->>SocketIO: Broadcast 'seat_reserved' to room
        SocketIO-->>Frontend: Seat reserved successfully
        SocketIO-->>OtherUser: Seat no longer available
        Frontend->>Frontend: Update UI - Seat marked as reserved
        OtherUser->>OtherUser: Update UI - Seat marked as unavailable
        
        Note over SocketIO,DB: Start 30-minute timer
        SocketIO->>SocketIO: Set timer for seat release
        
        alt Timer expires (30 minutes)
            SocketIO->>DB: Update seat status = AVAILABLE
            SocketIO->>SocketIO: Broadcast 'seat_released' to room
            SocketIO-->>Frontend: Seat released
            SocketIO-->>OtherUser: Seat available again
        else User completes checkout
            Frontend->>SocketIO: Emit 'checkout_complete'
            SocketIO->>DB: Keep seat RESERVED
            SocketIO->>SocketIO: Cancel timer
        end
    else Seat not available
        DB-->>SocketIO: Seat is RESERVED/OCCUPIED
        SocketIO-->>Frontend: Error: Seat already taken
        Frontend-->>User: Show error message
    end

    User->>Frontend: Hủy chọn ghế
    Frontend->>SocketIO: Emit 'release_seat' (seat_id)
    SocketIO->>DB: Update seat status = AVAILABLE
    SocketIO->>SocketIO: Broadcast 'seat_released' to room
    SocketIO-->>Frontend: Seat released
    SocketIO-->>OtherUser: Seat available again
```

## 7. System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend - React Application"
        UserPages[User Pages<br/>Home, EventDetail, Checkout]
        OrganizerPages[Organizer Pages<br/>Dashboard, EventList, CreateEvent]
        AdminPages[Admin Pages<br/>Dashboard, UserManagement, EventManagement]
        SharedComponents[Shared Components<br/>Header, Footer, LoadingSpinner]
        Context[Context Providers<br/>AuthContext, FavoriteContext]
    end

    subgraph "Backend - Flask API"
        AuthRoutes[Auth Routes<br/>/api/auth]
        EventRoutes[Event Routes<br/>/api/events]
        OrderRoutes[Order Routes<br/>/api/orders]
        PaymentRoutes[Payment Routes<br/>/api/payments]
        OrganizerRoutes[Organizer Routes<br/>/api/organizer]
        AdminRoutes[Admin Routes<br/>/api/admin]
        SeatRoutes[Seat Routes<br/>/api/seats]
    end

    subgraph "Services Layer"
        OrderService[OrderService<br/>create_order, cancel_order]
        EventService[EventService<br/>get_events, create_event]
        OrganizerService[OrganizerService<br/>get_dashboard_stats]
        AuditService[AuditService<br/>log_insert, log_update]
    end

    subgraph "Data Layer"
        Models[SQLAlchemy Models<br/>User, Event, Order, Payment, Ticket, Seat]
        Database[(TiDB Database)]
    end

    subgraph "Real-time Communication"
        SocketIO[Socket.IO Server<br/>Seat reservation updates]
    end

    subgraph "External Services"
        VNPay[VNPay Payment Gateway]
    end

    UserPages --> AuthRoutes
    UserPages --> EventRoutes
    UserPages --> OrderRoutes
    UserPages --> PaymentRoutes
    UserPages --> SeatRoutes
    UserPages --> SocketIO

    OrganizerPages --> AuthRoutes
    OrganizerPages --> OrganizerRoutes
    OrganizerPages --> EventRoutes

    AdminPages --> AuthRoutes
    AdminPages --> AdminRoutes

    AuthRoutes --> Models
    EventRoutes --> EventService
    EventRoutes --> Models
    OrderRoutes --> OrderService
    OrderRoutes --> Models
    PaymentRoutes --> Models
    PaymentRoutes --> VNPay
    OrganizerRoutes --> OrganizerService
    OrganizerRoutes --> Models
    AdminRoutes --> Models
    SeatRoutes --> Models
    SeatRoutes --> SocketIO

    OrderService --> Models
    EventService --> Models
    OrganizerService --> Models
    AuditService --> Models

    Models --> Database
    SocketIO --> Database
```

## 8. Database Entity Relationships

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ FAVORITE_EVENT : favorites
    USER ||--o{ AUDIT_LOG : creates
    USER ||--o{ ORGANIZER_INFO : has
    USER ||--|| ROLE : has
    
    EVENT ||--o{ TICKET_TYPE : has
    EVENT ||--o{ ORDER : generates
    EVENT ||--o{ FAVORITE_EVENT : "favorited by"
    EVENT ||--o{ SEAT : has
    EVENT ||--o{ DISCOUNT : applies_to
    EVENT ||--|| VENUE : held_at
    EVENT ||--|| EVENT_CATEGORY : belongs_to
    EVENT ||--|| USER : managed_by
    
    TICKET_TYPE ||--o{ TICKET : generates
    TICKET_TYPE ||--o{ SEAT : has
    
    ORDER ||--o{ TICKET : contains
    ORDER ||--|| PAYMENT : has
    ORDER ||--o{ DISCOUNT : uses
    
    SEAT ||--o| TICKET : reserved_by
    
    VENUE ||--o{ EVENT : hosts
    VENUE ||--|| USER : managed_by
    
    DISCOUNT ||--o{ ORDER : applied_in
    DISCOUNT ||--o| EVENT : applies_to
    DISCOUNT ||--|| USER : created_by
    
    USER {
        int user_id PK
        string email
        string full_name
        string phone
        int role_id FK
        boolean is_active
    }
    
    ROLE {
        int role_id PK
        string role_name
    }
    
    EVENT {
        int event_id PK
        string event_name
        int manager_id FK
        int venue_id FK
        int category_id FK
        string status
        datetime start_datetime
        datetime end_datetime
    }
    
    ORDER {
        int order_id PK
        int user_id FK
        string order_code
        decimal total_amount
        decimal final_amount
        string order_status
    }
    
    TICKET {
        int ticket_id PK
        int order_id FK
        int ticket_type_id FK
        int seat_id FK
        string ticket_code
        string ticket_status
    }
    
    PAYMENT {
        int payment_id PK
        int order_id FK
        string payment_method
        string payment_status
        decimal amount
    }
```

## 9. Order Status Flow

```mermaid
stateDiagram-v2
    [*] --> PENDING: Create Order
    
    PENDING --> PAID: Payment Success<br/>(VNPay/Cash)
    PENDING --> CANCELLED: Cancel Order<br/>(Before payment)
    
    PAID --> CANCELLATION_PENDING: User requests refund
    PAID --> COMPLETED: Event finished
    
    CANCELLATION_PENDING --> PAID: Cancel refund request
    CANCELLATION_PENDING --> REFUNDED: Admin approves refund
    
    CANCELLED --> [*]: Order cancelled
    COMPLETED --> [*]: Order completed
    REFUNDED --> [*]: Order refunded
    
    note right of PENDING
        Order created but not paid
        Seats/Tickets reserved
    end note
    
    note right of PAID
        Payment confirmed
        Tickets active
    end note
    
    note right of CANCELLATION_PENDING
        User requested refund
        Waiting for approval
    end note
```

## 10. Payment Status Flow

```mermaid
stateDiagram-v2
    [*] --> PENDING: Create Payment
    
    PENDING --> SUCCESS: Payment confirmed<br/>(VNPay/Cash)
    PENDING --> FAILED: Payment failed<br/>(VNPay error)
    
    SUCCESS --> [*]: Payment completed
    FAILED --> [*]: Payment failed
    
    note right of PENDING
        Payment record created
        Waiting for confirmation
    end note
    
    note right of SUCCESS
        Payment verified
        Order status updated to PAID
    end note
```

## Tóm tắt các Workflow chính

1. **Authentication Flow**: Đăng ký → Đăng nhập → JWT Token → Protected Routes
2. **Event Booking Flow**: Browse → Select Event → Choose Tickets/Seats → Checkout → Payment → Order Success
3. **Payment Flow**: Create Order → Create Payment → VNPay/Cash → Verify → Update Status
4. **Organizer Flow**: Login → Dashboard → Create/Edit Events → Manage Seats/Tickets → View Orders
5. **Admin Flow**: Login → Dashboard → Manage Users/Events/Orders → View Statistics → Audit Logs
6. **Real-time Seat Selection**: Socket.IO → Seat Reservation → Timer → Auto-release
7. **Order Lifecycle**: PENDING → PAID → COMPLETED/REFUNDED
8. **Payment Lifecycle**: PENDING → SUCCESS/FAILED
