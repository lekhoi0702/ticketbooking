USE ticketbookingdb;

-- ============================================
-- 1. BẢNG ROLE - VAI TRÒ NGƯỜI DÙNG
-- ============================================
CREATE TABLE Role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. BẢNG USER - NGƯỜI DÙNG
-- ============================================
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (role_id) REFERENCES Role(role_id),
    INDEX idx_email (email),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. BẢNG EVENTCATEGORY - DANH MỤC SỰ KIỆN
-- ============================================
CREATE TABLE EventCategory (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. BẢNG VENUE - ĐỊA ĐIỂM
-- ============================================
CREATE TABLE Venue (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    venue_name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    capacity INT NOT NULL,
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_city (city),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. BẢNG EVENT - SỰ KIỆN
-- ============================================
CREATE TABLE Event (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    venue_id INT NOT NULL,
    manager_id INT NOT NULL,
    event_name VARCHAR(500) NOT NULL,
    description TEXT,
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    sale_start_datetime DATETIME,
    sale_end_datetime DATETIME,
    banner_image_url VARCHAR(500),
    total_capacity INT NOT NULL,
    sold_tickets INT DEFAULT 0,
    status ENUM('DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES EventCategory(category_id),
    FOREIGN KEY (venue_id) REFERENCES Venue(venue_id),
    FOREIGN KEY (manager_id) REFERENCES User(user_id),
    INDEX idx_category (category_id),
    INDEX idx_venue (venue_id),
    INDEX idx_status (status),
    INDEX idx_start_date (start_datetime),
    INDEX idx_featured (is_featured),
    CONSTRAINT chk_event_datetime CHECK (end_datetime > start_datetime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. BẢNG TICKETTYPE - LOẠI VÉ
-- ============================================
CREATE TABLE TicketType (
    ticket_type_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(15, 2) NOT NULL,
    quantity INT NOT NULL,
    sold_quantity INT DEFAULT 0,
    sale_start DATETIME,
    sale_end DATETIME,
    max_per_order INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE CASCADE,
    INDEX idx_event (event_id),
    INDEX idx_active (is_active),
    CONSTRAINT chk_ticket_price CHECK (price >= 0),
    CONSTRAINT chk_ticket_quantity CHECK (sold_quantity <= quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. BẢNG ORDER - ĐƠN HÀNG
-- ============================================
CREATE TABLE `Order` (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    total_amount DECIMAL(15, 2) NOT NULL,
    final_amount DECIMAL(15, 2) NOT NULL,
    order_status ENUM('PENDING', 'PAID', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING',
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    INDEX idx_user (user_id),
    INDEX idx_order_code (order_code),
    INDEX idx_status (order_status),
    CONSTRAINT chk_order_amount CHECK (final_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. BẢNG PAYMENT - THANH TOÁN
-- ============================================
CREATE TABLE Payment (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    payment_method ENUM('CREDIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'MOMO', 'VNPAY') NOT NULL,
    transaction_id VARCHAR(255),
    amount DECIMAL(15, 2) NOT NULL,
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES `Order`(order_id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. BẢNG TICKET - VÉ
-- ============================================
CREATE TABLE Ticket (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    ticket_type_id INT NOT NULL,
    ticket_code VARCHAR(100) NOT NULL UNIQUE,
    ticket_status ENUM('ACTIVE', 'USED', 'CANCELLED', 'REFUNDED') DEFAULT 'ACTIVE',
    price DECIMAL(15, 2) NOT NULL,
    qr_code_url VARCHAR(500),
    holder_name VARCHAR(255),
    holder_email VARCHAR(255),
    checked_in_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES `Order`(order_id) ON DELETE CASCADE,
    FOREIGN KEY (ticket_type_id) REFERENCES TicketType(ticket_type_id),
    INDEX idx_order (order_id),
    INDEX idx_ticket_code (ticket_code),
    INDEX idx_status (ticket_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. BẢNG DISCOUNT - MÃ GIẢM GIÁ
-- ============================================
CREATE TABLE Discount (
    discount_id INT AUTO_INCREMENT PRIMARY KEY,
    discount_code VARCHAR(50) NOT NULL UNIQUE,
    discount_name VARCHAR(255) NOT NULL,
    discount_type ENUM('PERCENTAGE', 'FIXED_AMOUNT') NOT NULL,
    discount_value DECIMAL(15, 2) NOT NULL,
    max_discount_amount DECIMAL(15, 2),
    min_order_amount DECIMAL(15, 2) DEFAULT 0,
    usage_limit INT,
    used_count INT DEFAULT 0,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (discount_code),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. BẢNG REVIEW - ĐÁNH GIÁ
-- ============================================
CREATE TABLE Review (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    INDEX idx_event (event_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

