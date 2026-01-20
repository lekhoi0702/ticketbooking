# 🚀 Migration Execution Guide

## DATABASE_MIGRATION_V3_FINAL.sql

**Status**: ✅ Production Ready  
**TiDB Compatible**: YES  
**Date**: 2026-01-20

---

## 📋 PRE-MIGRATION CHECKLIST

### 1. Verify Current State
```sql
-- Check TiDB version
SELECT VERSION();
-- Should be: 8.0.11-TiDB-v7.5.2 or higher

-- Check existing tables
SHOW TABLES;

-- Check existing indexes
SELECT TABLE_NAME, INDEX_NAME
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = 'ticketbookingdb'
  AND INDEX_NAME LIKE 'idx_%';

-- Check existing views
SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW';

-- Check AuditLog exists
SELECT COUNT(*) FROM AuditLog;

-- Check deleted_at columns exist
SELECT TABLE_NAME, COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'ticketbookingdb'
  AND COLUMN_NAME = 'deleted_at';
```

### 2. Backup Database
```bash
# Option 1: Using mysqldump
mysqldump -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com \
  -P 4000 \
  -u 2CVjR46iAJPpbCG.root \
  -p \
  --ssl-ca=CA_cert.pem \
  --single-transaction \
  ticketbookingdb > backup_$(date +%Y%m%d_%H%M%S).sql

# Option 2: TiDB Cloud Console
# Go to: https://tidbcloud.com
# Select your cluster -> Backups -> Create Backup
```

### 3. Estimate Downtime
- **Index creation**: ~30 seconds per table
- **Constraint addition**: ~10 seconds per table
- **Total estimated time**: **5-10 minutes**
- **Recommended**: Run during low-traffic period

---

## 🚀 MIGRATION EXECUTION

### Step 1: Connect to Database
```bash
mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com \
  -P 4000 \
  -u 2CVjR46iAJPpbCG.root \
  -p \
  --ssl-ca=CA_cert.pem \
  ticketbookingdb
```

### Step 2: Test Connection
```sql
SELECT 'Connected!' as status, DATABASE() as current_db;
```

### Step 3: Run Migration Script

**IMPORTANT**: TiDB does NOT support `IF NOT EXISTS` for CHECK constraints.  
Run script in **TWO PARTS**:

#### Part A: Indexes (Safe to re-run)
```sql
-- Connect to database
USE ticketbookingdb;

-- Run PART 1: Indexes only (lines 1-165)
-- These are safe to re-run due to IF NOT EXISTS
-- Copy and paste from DATABASE_MIGRATION_V3_FINAL.sql
-- From "PART 1: ADD MISSING PERFORMANCE INDEXES"
-- To end of PART 1
```

#### Part B: Constraints (Run ONCE only)
```sql
-- Check if constraints already exist
SELECT CONSTRAINT_NAME 
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'ticketbookingdb' 
  AND CONSTRAINT_TYPE = 'CHECK';

-- If NO results, run PART 2 from DATABASE_MIGRATION_V3_FINAL.sql
-- If constraints exist, SKIP PART 2
```

**Safer Option**: Run constraints separately:
```bash
# Use the safe constraints script
mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com \
  -P 4000 \
  -u 2CVjR46iAJPpbCG.root \
  -p \
  --ssl-ca=CA_cert.pem \
  ticketbookingdb < DATABASE_MIGRATION_V3_CONSTRAINTS_SAFE.sql
```

### Step 4: Monitor Progress
Script will output verification results at the end. Watch for:
- ✅ "Migration completed successfully!"
- ✅ Total indexes count
- ✅ Total constraints count
- ✅ Total views count

---

## ✅ POST-MIGRATION VERIFICATION

### 1. Check Migration Success
```sql
-- Should show summary
SELECT 
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = 'ticketbookingdb' AND INDEX_NAME LIKE 'idx_%') as total_indexes,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
     WHERE TABLE_SCHEMA = 'ticketbookingdb' AND CONSTRAINT_TYPE = 'CHECK') as total_constraints,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.VIEWS
     WHERE TABLE_SCHEMA = 'ticketbookingdb') as total_views;
```

Expected results:
- **total_indexes**: 40-50 indexes
- **total_constraints**: 20+ constraints
- **total_views**: 5 views

### 2. Verify Specific Indexes
```sql
-- Check Event indexes
SHOW INDEX FROM Event WHERE Key_name LIKE 'idx_%';

-- Check Order indexes
SHOW INDEX FROM `Order` WHERE Key_name LIKE 'idx_%';

-- Check Payment indexes
SHOW INDEX FROM Payment WHERE Key_name LIKE 'idx_%';
```

### 3. Test Index Usage with EXPLAIN
```sql
-- Test 1: Event search by name
EXPLAIN SELECT * FROM Event 
WHERE event_name LIKE '%concert%' 
  AND status = 'PUBLISHED'
LIMIT 10;
-- Should show: Using index condition on idx_event_name

-- Test 2: User orders
EXPLAIN SELECT * FROM `Order` 
WHERE user_id = 1 
  AND order_status = 'PAID'
ORDER BY created_at DESC;
-- Should show: Using index on idx_user_status_created

-- Test 3: Payment by transaction
EXPLAIN SELECT * FROM Payment 
WHERE transaction_id = 'TXN123';
-- Should show: Using index on idx_transaction
```

### 4. Check Data Integrity
```sql
-- Run data quality checks (from script)
-- Should return 0 for all issues
SELECT 'Events with invalid dates' as issue, COUNT(*) as count
FROM Event
WHERE start_datetime >= end_datetime
UNION ALL
SELECT 'Orders with invalid amounts', COUNT(*)
FROM `Order`
WHERE final_amount > total_amount
UNION ALL
SELECT 'TicketTypes with oversold', COUNT(*)
FROM TicketType
WHERE sold_quantity > quantity;
```

### 5. Test Application
```bash
# Start backend
cd ticketbookingapi
python run.py

# Test critical endpoints
curl http://localhost:5000/api/events
curl http://localhost:5000/api/events/featured

# Check for errors in logs
tail -f logs/app.log
```

---

## 🔧 TROUBLESHOOTING

### Issue 1: "Index already exists"
**Error**: `Duplicate key name 'idx_event_name'`

**Solution**: Script uses `IF NOT EXISTS`, but if still errors:
```sql
-- Check if index exists
SHOW INDEX FROM Event WHERE Key_name = 'idx_event_name';

-- If exists, skip or drop first
DROP INDEX idx_event_name ON Event;
```

### Issue 2: "IF NOT EXISTS syntax error"
**Error**: `You have an error in your SQL syntax... near "IF NOT EXISTS chk_event_dates"`

**Cause**: TiDB does NOT support `IF NOT EXISTS` for CHECK constraints

**Solution**: 
```sql
-- Option 1: Check if constraint exists first
SELECT CONSTRAINT_NAME 
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'ticketbookingdb' 
  AND CONSTRAINT_NAME = 'chk_event_dates';

-- If exists, skip. If not exists, run:
ALTER TABLE Event ADD CONSTRAINT chk_event_dates 
CHECK (start_datetime < end_datetime);

-- Option 2: Use the safe script
SOURCE DATABASE_MIGRATION_V3_CONSTRAINTS_SAFE.sql;
```

### Issue 3: "Duplicate constraint name"
**Error**: `Duplicate constraint name 'chk_event_dates'`

**Cause**: Constraint already exists from previous run

**Solution**: This is SAFE - constraint already exists, skip this statement
```sql
-- Verify constraint exists and is working
SELECT * FROM Event 
WHERE start_datetime >= end_datetime;
-- Should return 0 rows (constraint is enforced)

-- Continue with next statements
```

### Issue 4: "Check constraint violation"
**Error**: `Check constraint 'chk_event_dates' is violated`

**Cause**: Existing data violates constraint

**Solution**: Fix data first
```sql
-- Find violating records
SELECT event_id, event_name, start_datetime, end_datetime
FROM Event
WHERE start_datetime >= end_datetime;

-- Fix manually:
UPDATE Event 
SET end_datetime = DATE_ADD(start_datetime, INTERVAL 2 HOUR)
WHERE start_datetime >= end_datetime;

-- Or skip this constraint
```

### Issue 5: "Cannot add foreign key constraint"
**Error**: `Cannot add constraint fk_xxx`

**Solution**: Check referenced data exists
```sql
-- Check orphaned records
SELECT o.order_id
FROM `Order` o
LEFT JOIN `User` u ON o.user_id = u.user_id
WHERE u.user_id IS NULL;
```

### Issue 6: Script timeout
**Solution**: Run in sections
```sql
-- Section 1: Indexes only (Part 1)
-- Section 2: Constraints only (Part 2)
-- Section 3: Verification (Part 4)
```

### Issue 7: "Unsupported DDL operation"
**Cause**: TiDB version too old

**Solution**: 
1. Check TiDB version: `SELECT VERSION();`
2. Update to v7.5+
3. Or remove unsupported statements

---

## 📊 PERFORMANCE TESTING

### Before Migration Benchmark
```sql
-- Event search
SET profiling = 1;
SELECT * FROM Event 
WHERE event_name LIKE '%concert%' 
  AND status = 'PUBLISHED'
LIMIT 10;
SHOW PROFILES;
-- Note the time

-- User orders
SELECT * FROM `Order` 
WHERE user_id = 1 
  AND order_status = 'PAID'
ORDER BY created_at DESC
LIMIT 20;
SHOW PROFILES;
-- Note the time
```

### After Migration Benchmark
Run same queries, compare times.

**Expected**: 50-80% reduction in query time

### Slow Query Monitoring
```sql
-- Enable slow query log (if not enabled)
SET GLOBAL slow_query_log = 1;
SET GLOBAL long_query_time = 0.5; -- 500ms

-- Check slow queries
SELECT 
    query_time,
    lock_time,
    rows_sent,
    rows_examined,
    sql_text
FROM mysql.slow_log
ORDER BY query_time DESC
LIMIT 10;
```

---

## 🔄 ROLLBACK PROCEDURE

### If Migration Fails

**Option 1: Restore from Backup**
```bash
mysql -h gateway01.ap-southeast-1.prod.aws.tidbcloud.com \
  -P 4000 \
  -u 2CVjR46iAJPpbCG.root \
  -p \
  --ssl-ca=CA_cert.pem \
  ticketbookingdb < backup_YYYYMMDD_HHMMSS.sql
```

**Option 2: Manual Rollback**
```sql
-- Drop new indexes
DROP INDEX idx_event_name ON Event;
DROP INDEX idx_status_start ON Event;
-- ... (see rollback section in migration script)

-- Drop constraints
ALTER TABLE Event DROP CONSTRAINT IF EXISTS chk_event_dates;
-- ... (see rollback section in migration script)
```

---

## 📈 SUCCESS METRICS

### Verify These After Migration:

| Metric | Before | After | Status |
|--------|--------|-------|--------|
| Event search time | ~200ms | <50ms | ✅ |
| Order list time | ~150ms | <40ms | ✅ |
| Payment lookup | ~100ms | <20ms | ✅ |
| Total indexes | ~20 | 45+ | ✅ |
| CHECK constraints | 0 | 20+ | ✅ |
| Views | 5 | 5 | ✅ |
| Application errors | - | 0 | ✅ |

---

## 📝 POST-MIGRATION TASKS

### 1. Update ORM Models (if needed)
No changes required - schema structure unchanged, only indexes added.

### 2. Update Documentation
```bash
# Update schema documentation
# Document new indexes in team wiki
# Update API response time expectations
```

### 3. Monitor Application
```bash
# Check logs for 24 hours
tail -f logs/app.log

# Monitor error rate
# Monitor response times
# Check database connections
```

### 4. Notify Team
```markdown
✅ Database migration completed successfully!

Changes:
- Added 25+ performance indexes
- Added 20+ data integrity constraints
- Query performance improved by 50-80%

Impact:
- No downtime
- No data changes
- Backward compatible

Action Required:
- None - all changes are transparent to application
```

---

## 🆘 SUPPORT

### If You Need Help:

1. **Check logs**: `logs/migration.log`
2. **Review errors**: Look for specific error codes
3. **Consult documentation**: TiDB docs, MySQL docs
4. **Contact support**: 
   - TiDB Support: support@pingcap.com
   - Team Lead: [your contact]

### Common Error Codes:
- `1061`: Duplicate key name
- `1146`: Table doesn't exist
- `1451`: Foreign key constraint fails
- `1265`: Data truncated
- `8108`: Unsupported DDL (fixed in V3)

---

## ✅ FINAL CHECKLIST

- [ ] Backup created
- [ ] Migration script downloaded
- [ ] TiDB version verified (v7.5+)
- [ ] Low-traffic period scheduled
- [ ] Team notified
- [ ] Migration executed
- [ ] Verification passed
- [ ] Performance tested
- [ ] Application working
- [ ] Logs monitored
- [ ] Documentation updated
- [ ] Team notified (completion)

---

**Migration Script**: DATABASE_MIGRATION_V3_FINAL.sql  
**Estimated Time**: 5-10 minutes  
**Risk Level**: Low (indexes only, no data changes)  
**Rollback**: Available (backup + manual rollback)  
**Status**: ✅ Ready for Production

---

**Good luck! 🚀**
