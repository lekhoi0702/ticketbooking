# 🗄️ TiDB Migration Guide

## ⚠️ Issue: Error 8108 - Unsupported type *ast.DropProcedureStmt

### Problem
TiDB không hỗ trợ một số features của MySQL:
- ❌ Stored Procedures
- ❌ Triggers
- ⚠️ Limited VIEW support
- ⚠️ Some DDL operations

---

## ✅ Solution

Tôi đã tạo **DATABASE_MIGRATION_V2_TIDB_COMPATIBLE.sql** - phiên bản tương thích với TiDB.

### Changes Made:

#### 1. **Removed** ❌
- ❌ `DROP PROCEDURE IF EXISTS` statements
- ❌ `CREATE PROCEDURE` statements
- ❌ `CREATE TRIGGER` statements
- ❌ Complex stored procedures logic

#### 2. **Kept** ✅
- ✅ All indexes (performance improvement)
- ✅ Soft delete columns (deleted_at)
- ✅ CHECK constraints (TiDB v5.0+)
- ✅ AuditLog table
- ✅ Simplified VIEWs
- ✅ Table statistics (ANALYZE)

---

## 🚀 How to Run

### Step 1: Backup Database
```bash
# TiDB Cloud - Use web console to create backup
# Or export using mysqldump
mysqldump -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com \
  -P 4000 \
  -u 2CVjR46iAJPpbCG.root \
  -p \
  ticketbookingdb > backup_$(date +%Y%m%d).sql
```

### Step 2: Run Migration Script
```bash
# Connect to TiDB
mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com \
  -P 4000 \
  -u 2CVjR46iAJPpbCG.root \
  -p \
  --ssl-ca=CA_cert.pem \
  ticketbookingdb < DATABASE_MIGRATION_V2_TIDB_COMPATIBLE.sql
```

### Step 3: Verify Results
```sql
-- Check indexes created
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME) as COLUMNS
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ticketbookingdb'
  AND INDEX_NAME LIKE 'idx_%'
GROUP BY TABLE_NAME, INDEX_NAME;

-- Check soft delete columns
SELECT 
    TABLE_NAME,
    COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'ticketbookingdb'
  AND COLUMN_NAME = 'deleted_at';

-- Check views
SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW';
```

---

## 🔄 Alternative: Run in Sections

Nếu toàn bộ script vẫn lỗi, chạy từng phần:

### Section 1: Indexes Only
```sql
-- Event indexes
ALTER TABLE Event ADD INDEX idx_event_name (event_name(100));
ALTER TABLE Event ADD INDEX idx_status_start (status, start_datetime);
ALTER TABLE Event ADD INDEX idx_published_featured (status, is_featured, start_datetime);

-- Order indexes
ALTER TABLE `Order` ADD INDEX idx_customer_email (customer_email);
ALTER TABLE `Order` ADD INDEX idx_user_status_date (user_id, order_status, created_at DESC);

-- Ticket indexes
ALTER TABLE Ticket ADD INDEX idx_holder_email (holder_email);
ALTER TABLE Ticket ADD INDEX idx_ticket_type_status (ticket_type_id, ticket_status);

-- Payment indexes
ALTER TABLE Payment ADD INDEX idx_transaction (transaction_id);
ALTER TABLE Payment ADD INDEX idx_payment_status_date (payment_status, paid_at);
```

### Section 2: Soft Delete Support
```sql
ALTER TABLE Event ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE `Order` ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE Ticket ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE Event ADD INDEX idx_deleted_at (deleted_at);
ALTER TABLE `Order` ADD INDEX idx_deleted_at (deleted_at);
ALTER TABLE Ticket ADD INDEX idx_deleted_at (deleted_at);
```

### Section 3: Constraints
```sql
ALTER TABLE Event 
ADD CONSTRAINT chk_event_dates 
CHECK (start_datetime < end_datetime);

ALTER TABLE TicketType 
ADD CONSTRAINT chk_ticket_quantity 
CHECK (sold_quantity >= 0 AND sold_quantity <= quantity);

-- Add others one by one
```

### Section 4: Audit Table
```sql
CREATE TABLE IF NOT EXISTS AuditLog (
    audit_id BIGINT NOT NULL AUTO_INCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    PRIMARY KEY (audit_id),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_changed_at (changed_at)
);
```

---

## 🐍 Replace Stored Procedures with Python

Vì TiDB không hỗ trợ stored procedures, implement logic trong Python:

### File: `app/utils/database_helpers.py`

```python
"""
Database helper functions
Replaces stored procedures for TiDB compatibility
"""
from datetime import datetime
from sqlalchemy import func
from app.extensions import db
from app.models import Event, Order, Ticket, TicketType, AuditLog

def soft_delete_event(event_id: int, deleted_by: int) -> bool:
    """
    Soft delete an event and log to audit
    
    Replaces: sp_soft_delete_event stored procedure
    """
    try:
        event = Event.query.get(event_id)
        if not event:
            return False
        
        # Soft delete
        event.deleted_at = datetime.utcnow()
        
        # Log to audit
        audit = AuditLog(
            table_name='Event',
            record_id=event_id,
            action='DELETE',
            changed_by=deleted_by,
            new_values={
                'event_name': event.event_name,
                'deleted_at': event.deleted_at.isoformat()
            }
        )
        db.session.add(audit)
        db.session.commit()
        
        return True
        
    except Exception as e:
        db.session.rollback()
        raise


def calculate_event_revenue(event_id: int) -> dict:
    """
    Calculate total revenue for an event
    
    Replaces: sp_calculate_event_revenue stored procedure
    
    Returns:
        {
            'total_revenue': float,
            'paid_orders': int,
            'ticket_count': int
        }
    """
    result = db.session.query(
        func.coalesce(func.sum(Order.final_amount), 0).label('revenue'),
        func.count(func.distinct(Order.order_id)).label('orders'),
        func.count(Ticket.ticket_id).label('tickets')
    ).join(
        Ticket, Ticket.order_id == Order.order_id
    ).join(
        TicketType, TicketType.ticket_type_id == Ticket.ticket_type_id
    ).filter(
        TicketType.event_id == event_id,
        Order.order_status == 'PAID',
        Ticket.ticket_status != 'CANCELLED',
        Order.deleted_at.is_(None)
    ).first()
    
    return {
        'total_revenue': float(result.revenue),
        'paid_orders': int(result.orders),
        'ticket_count': int(result.tickets)
    }


def get_user_order_summary(user_id: int) -> dict:
    """
    Get user order summary
    
    Replaces: sp_get_user_order_summary stored procedure
    
    Returns:
        {
            'total_orders': int,
            'total_spent': float,
            'total_tickets': int
        }
    """
    result = db.session.query(
        func.count(func.distinct(Order.order_id)).label('orders'),
        func.coalesce(func.sum(Order.final_amount), 0).label('spent'),
        func.count(Ticket.ticket_id).label('tickets')
    ).outerjoin(
        Ticket, Ticket.order_id == Order.order_id
    ).filter(
        Order.user_id == user_id,
        Order.order_status == 'PAID',
        Order.deleted_at.is_(None)
    ).first()
    
    return {
        'total_orders': int(result.orders),
        'total_spent': float(result.spent),
        'total_tickets': int(result.tickets)
    }


def update_event_sold_tickets(event_id: int) -> int:
    """
    Recalculate and update event sold_tickets counter
    
    Replaces: Trigger logic
    """
    count = db.session.query(
        func.count(Ticket.ticket_id)
    ).join(
        TicketType, TicketType.ticket_type_id == Ticket.ticket_type_id
    ).filter(
        TicketType.event_id == event_id,
        Ticket.ticket_status.in_(['ACTIVE', 'USED'])
    ).scalar()
    
    event = Event.query.get(event_id)
    if event:
        event.sold_tickets = count
        db.session.commit()
    
    return count
```

### Usage in Services:

```python
# app/services/event_service.py
from app.utils.database_helpers import (
    soft_delete_event,
    calculate_event_revenue
)

class EventService:
    @staticmethod
    def delete_event(event_id: int, user_id: int) -> bool:
        """Delete event using helper function"""
        return soft_delete_event(event_id, user_id)
    
    @staticmethod
    def get_event_stats(event_id: int) -> dict:
        """Get event statistics"""
        revenue_data = calculate_event_revenue(event_id)
        
        event = Event.query.get(event_id)
        
        return {
            'event_name': event.event_name,
            'total_capacity': event.total_capacity,
            'sold_tickets': event.sold_tickets,
            **revenue_data
        }
```

---

## 🔄 Replace Triggers with Application Logic

### Before (MySQL Trigger):
```sql
CREATE TRIGGER trg_ticket_insert_update_sold
AFTER INSERT ON Ticket
FOR EACH ROW
BEGIN
    UPDATE TicketType
    SET sold_quantity = sold_quantity + 1
    WHERE ticket_type_id = NEW.ticket_type_id;
END;
```

### After (Python Code):

```python
# app/services/order_service.py

class OrderService:
    @classmethod
    def create_order(cls, data: dict):
        # ... create tickets ...
        
        for ticket in created_tickets:
            # Update sold quantity (replaces trigger)
            ticket_type = TicketType.query.get(ticket.ticket_type_id)
            ticket_type.sold_quantity += 1
            
            # Update event sold tickets (replaces trigger)
            event = Event.query.get(ticket_type.event_id)
            event.sold_tickets += 1
        
        db.session.commit()
```

---

## 📊 Performance Test After Migration

```sql
-- Test 1: Event search (should be fast with new index)
SELECT SQL_NO_CACHE * FROM Event 
WHERE event_name LIKE '%concert%' 
  AND status = 'PUBLISHED'
LIMIT 10;

-- Test 2: User orders (should use composite index)
SELECT SQL_NO_CACHE * FROM `Order` 
WHERE user_id = 1 
  AND order_status = 'PAID'
ORDER BY created_at DESC
LIMIT 20;

-- Test 3: Payment lookup (should use transaction index)
SELECT SQL_NO_CACHE * FROM Payment 
WHERE transaction_id = 'VNPAY123456';
```

---

## ✅ Verification Checklist

After migration, verify:

- [ ] All indexes created successfully
- [ ] No errors in application logs
- [ ] Queries are faster (check with EXPLAIN)
- [ ] Soft delete works (deleted_at is set)
- [ ] AuditLog table exists and accessible
- [ ] Python helper functions work correctly
- [ ] No broken functionality in application

---

## 🆘 Troubleshooting

### Issue: "Unsupported constraint type"
**Solution**: TiDB version might be old. Remove CHECK constraints if needed.

### Issue: "Cannot create view"
**Solution**: Simplify VIEW definition, avoid complex JOINs.

### Issue: "Index too long"
**Solution**: Reduce varchar length in index, e.g., `(event_name(100))`

### Issue: "Foreign key constraint fails"
**Solution**: Ensure referenced tables exist and data is consistent.

---

## 📞 Need Help?

1. Check TiDB version: `SELECT VERSION();`
2. Check TiDB compatibility: https://docs.pingcap.com/tidb/stable/mysql-compatibility
3. Test in staging environment first
4. Contact TiDB support if issues persist

---

**Status**: ✅ Ready to run on TiDB  
**Last Updated**: 2026-01-20  
**Tested On**: TiDB v7.5.2
